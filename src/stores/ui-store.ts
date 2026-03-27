import { create } from "zustand";

type Lang = "en" | "th";

interface UIState {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  lang: "en",
  setLang: (lang) => set({ lang }),
  toggleLang: () => set((s) => ({ lang: s.lang === "en" ? "th" : "en" })),
}));
