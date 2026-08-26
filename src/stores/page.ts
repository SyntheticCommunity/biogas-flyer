import { create } from "zustand";

interface PageState {
  title: string;
  subtitle: string;
  setPageTitle: (title: string, subtitle?: string) => void;
}

export const usePageStore = create<PageState>((set) => ({
  title: "沼液还田科普站",
  subtitle: "科学还田 · 绿色循环 · 乡村振兴",
  setPageTitle: (title, subtitle) => set({ title, subtitle }),
}));
