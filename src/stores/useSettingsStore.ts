import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  geminiApiKey: string;
  rememberApiKey: boolean;
  masterPromptOverride: string;
  templatesOverride: string;
  geminiModel: string;
  theme: "light" | "dark" | "system";
  setGeminiApiKey: (key: string) => void;
  setRememberApiKey: (remember: boolean) => void;
  setMasterPromptOverride: (value: string) => void;
  setTemplatesOverride: (value: string) => void;
  resetConfiguration: () => void;
  setGeminiModel: (model: string) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  clearData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: "",
      rememberApiKey: false,
      masterPromptOverride: "",
      templatesOverride: "",
      geminiModel: "auto",
      theme: "system",
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setRememberApiKey: (remember) => set({ rememberApiKey: remember }),
      setMasterPromptOverride: (value) => set({ masterPromptOverride: value }),
      setTemplatesOverride: (value) => set({ templatesOverride: value }),
      resetConfiguration: () => set({ masterPromptOverride: "", templatesOverride: "" }),
      setGeminiModel: (model) => set({ geminiModel: model }),
      setTheme: (theme) => set({ theme }),
      clearData: () => set({ geminiApiKey: "", rememberApiKey: false }),
    }),
    {
      name: "storyboard_settings_v1",
      partialize: (state) => ({
        geminiApiKey: state.rememberApiKey ? state.geminiApiKey : "",
        rememberApiKey: state.rememberApiKey,
        theme: state.theme,
        masterPromptOverride: state.masterPromptOverride,
        templatesOverride: state.templatesOverride,
        geminiModel: state.geminiModel,
      }),
    }
  )
);
