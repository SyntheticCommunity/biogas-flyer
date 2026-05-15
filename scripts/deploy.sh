#!/usr/bin/env bash
#
# deploy.sh — Bootstrap and deploy the biogas-flyer stack on a fresh
# Ubuntu/Debian server (Alibaba Cloud, 2 cores / 2 GB RAM).
#
# Target server : 139.129.128.105
# Domain        : biogas.bio-spring.top
# App root      : /opt/biogas
#
# Usage:
#   # First-time setup (installs everything):
#   sudo bash scripts/deploy.sh
#
#   # Or run a specific step:
#   sudo bash scripts/deploy.sh --step packages
#   sudo bash scripts/deploy.sh --step code
#   sudo bash scripts deploy.sh --step backend
#   sudo bash scripts/deploy.sh --step frontend
#   sudo bash scripts/deploy.sh --step services
#   sudo bash scripts/deploy.sh --step nginx
#   sudo bash scripts deploy.sh --step ssl
#
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────────
APP_DIR="/opt/biogas"
DOMAIN="biogas.bio-spring.top"
BACKEND_PORT=8000
FRONTEND_PORT=3000
REPO_URL="git@github.com:SyntheticCommunity/biogas-flyer.git"
PYTHON_VERSION="3.11"
NODE_MAJOR=20
DEPLOY_USER="${SUDO_USER:-$(whoami)}"

# ── Helpers ────────────────────────────────────────────────────────────────────
log()  { printf '\n\033[1;32m==>%s\033[0m\n' " $1"; }
warn() { printf '\033[1;33m::> %s\033[0m\n' "$1"; }
err()  { printf '\033[1;31m!!> %s\033[0m\n' "$1" >&2; exit 1; }

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    err "This script must be run as root (use sudo)."
  fi
}

# ── Step: System packages ──────────────────────────────────────────────────────
install_packages() {
  log "Installing system packages"

  apt-get update -qq
  apt-get install -y -qq \
    git curl wget gnupg2 ca-certificates lsb-release \
    build-essential libffi-dev libssl-dev \
    nginx certbot python3-certbot-nginx

  # Python
  if ! command -v python${PYTHON_VERSION} &>/dev/null; then
    apt-get install -y -qq software-properties-common
    add-apt-repository -y ppa:deadsnakes/ppa
    apt-get update -qq
  fi
  apt-get install -y -qq python${PYTHON_VERSION} python${PYTHON_VERSION}-venv python${PYTHON_VERSION}-dev

  # Node.js 20+
  if ! command -v node &>/dev/null || [ "$(node -v | cut -d. -f1 | tr -d 'v')" -lt "$NODE_MAJOR" ]; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
    apt-get install -y -qq nodejs
  fi

  # Confirm versions
  log "Installed versions"
  python${PYTHON_VERSION} --version
  node --version
  npm --version
}

# ── Step: Clone / pull code ────────────────────────────────────────────────────
setup_code() {
  log "Setting up code at ${APP_DIR}"

  if [ -d "${APP_DIR}/.git" ]; then
    cd "${APP_DIR}"
    git pull --ff-only origin master
  else
    git clone "${REPO_URL}" "${APP_DIR}"
    cd "${APP_DIR}"
  fi

  chown -R root:root "${APP_DIR}"
}

# ── Step: Backend (venv + deps + migrate) ──────────────────────────────────────
setup_backend() {
  log "Setting up backend venv and dependencies"

  cd "${APP_DIR}/backend"

  # Create venv if it does not exist
  if [ ! -d "venv" ]; then
    python${PYTHON_VERSION} -m venv venv
  fi
  # shellcheck disable=SC1091
  source venv/bin/activate

  pip install --upgrade pip setuptools wheel -q
  pip install -e ".[dev]" -q
  pip install "magic-pdf[full]" -q

  # Data directory
  mkdir -p "${APP_DIR}/backend/data"
  chown -R root:root "${APP_DIR}/backend/data"

  # Alembic migrations
  log "Running Alembic migrations"
  alembic upgrade head

  deactivate
}

# ── Step: Frontend (npm install + build) ──────────────────────────────────────
setup_frontend() {
  log "Installing frontend dependencies and building"

  cd "${APP_DIR}/frontend"
  npm ci --no-audit
  npm run build

  chown -R root:root "${APP_DIR}/frontend/.next"
}

# ── Step: Systemd services ────────────────────────────────────────────────────
setup_services() {
  log "Creating systemd service units"

  cat > /etc/systemd/system/biogas-api.service <<EOF
[Unit]
Description=Biogas FastAPI Backend (uvicorn)
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/backend
ExecStart=${APP_DIR}/backend/venv/bin/uvicorn src.biogas.main:app --host 0.0.0.0 --port ${BACKEND_PORT} --workers 2
Restart=on-failure
RestartSec=5
Environment=PYTHONUNBUFFERED=1

[Install]
WantedBy=multi-user.target
EOF

  cat > /etc/systemd/system/biogas-frontend.service <<EOF
[Unit]
Description=Biogas Next.js Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${APP_DIR}/frontend
ExecStart=$(command -v npx) next start -p ${FRONTEND_PORT}
Restart=on-failure
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable biogas-api.service biogas-frontend.service
  systemctl restart biogas-api.service biogas-frontend.service

  log "Services started. Checking status..."
  systemctl --no-pager status biogas-api.service --lines=5 || true
  systemctl --no-pager status biogas-frontend.service --lines=5 || true
}

# ── Step: Nginx reverse proxy ─────────────────────────────────────────────────
setup_nginx() {
  log "Configuring Nginx for ${DOMAIN}"

  cat > /etc/nginx/sites-available/biogas <<EOF
server {
    listen 80;
    server_name ${DOMAIN};

    client_max_body_size 50M;

    # API proxy
    location /api/ {
        proxy_pass         http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_read_timeout 300s;
        proxy_buffering    off;
    }

    # Frontend proxy
    location / {
        proxy_pass         http://127.0.0.1:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header   Host              \$host;
        proxy_set_header   X-Real-IP         \$remote_addr;
        proxy_set_header   X-Forwarded-For   \$proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto \$scheme;
        proxy_set_header   Upgrade           \$http_upgrade;
        proxy_set_header   Connection        "upgrade";
    }
}
EOF

  ln -sf /etc/nginx/sites-available/biogas /etc/nginx/sites-enabled/biogas
  rm -f /etc/nginx/sites-enabled/default

  nginx -t
  systemctl reload nginx
}

# ── Step: SSL certificate via certbot ──────────────────────────────────────────
setup_ssl() {
  log "Obtaining SSL certificate for ${DOMAIN}"

  certbot --nginx \
    -d "${DOMAIN}" \
    --non-interactive \
    --agree-tos \
    --email "admin@${DOMAIN}" \
    --redirect

  log "Certbot auto-renewal configured (systemd timer)."
}

# ── Main ───────────────────────────────────────────────────────────────────────
main() {
  require_root

  local step="${1:-all}"

  case "$step" in
    --step)
      shift
      case "${1:-}" in
        packages) install_packages ;;
        code)     setup_code ;;
        backend)  setup_backend ;;
        frontend) setup_frontend ;;
        services) setup_services ;;
        nginx)    setup_nginx ;;
        ssl)      setup_ssl ;;
        *)        err "Unknown step: ${1}. Valid: packages|code|backend|frontend|services|nginx|ssl" ;;
      esac
      ;;
    all|"")
      install_packages
      setup_code
      setup_backend
      setup_frontend
      setup_services
      setup_nginx
      setup_ssl
      log "Deployment complete! Visit https://${DOMAIN}"
      ;;
    *)
      err "Usage: $0 [--step <packages|code|backend|frontend|services|nginx|ssl>]"
      ;;
  esac
}

main "$@"
