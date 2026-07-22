import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  geminiApiKey: string;
  rememberApiKey: boolean;
  theme: "light" | "dark" | "system";
  setGeminiApiKey: (key: string) => void;
  setRememberApiKey: (remember: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  clearData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: "",
      rememberApiKey: false,
      theme: "system",
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setRememberApiKey: (remember) => {
        set({ rememberApiKey: remember });
        if (!remember) {
          set({ geminiApiKey: "" });
        }
      },
      setTheme: (theme) => set({ theme }),
      clearData: () => set({ geminiApiKey: "", rememberApiKey: false }),
    }),
    {
      name: "storyboard_settings_v1",
      partialize: (state) => ({
        geminiApiKey: state.rememberApiKey ? state.geminiApiKey : "",
        rememberApiKey: state.rememberApiKey,
        theme: state.theme,
      }),
    }
  )
);