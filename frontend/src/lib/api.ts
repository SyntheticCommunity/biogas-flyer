const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "/api";

/**
 * Fetch wrapper that automatically attaches the JWT token from localStorage
 * to the Authorization header.
 */
export async function fetchAPI<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }

  // Handle 204 No Content (e.g. DELETE)
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}
