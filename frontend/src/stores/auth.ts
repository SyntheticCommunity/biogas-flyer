import { create } from "zustand";

interface UserInfo {
  id: string;
  name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
}

interface AuthState {
  user: UserInfo | null;
  token: string | null;
  setAuth: (user: UserInfo, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: typeof window !== "undefined" ? localStorage.getItem("token") : null,

  setAuth: (user: UserInfo, token: string) => {
    localStorage.setItem("token", token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  isAdmin: () => {
    const { user } = get();
    return user?.is_admin ?? false;
  },
}));
