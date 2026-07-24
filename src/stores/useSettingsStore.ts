import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsState {
  geminiApiKey: string;
  rememberApiKey: boolean;
  masterPromptOverride: string;
  markdownMasterPromptOverride: string;
  templatesOverride: string;
  geminiModel: string;
  generateAction: "ask" | "generate" | "copy";
  theme: "light" | "dark" | "system";
  setGeminiApiKey: (key: string) => void;
  setRememberApiKey: (remember: boolean) => void;
  setMasterPromptOverride: (value: string) => void;
  setMarkdownMasterPromptOverride: (value: string) => void;
  setTemplatesOverride: (value: string) => void;
  resetConfiguration: () => void;
  setGeminiModel: (model: string) => void;
  setGenerateAction: (action: "ask" | "generate" | "copy") => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  clearData: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      geminiApiKey: "",
      rememberApiKey: false,
      masterPromptOverride: "",
      markdownMasterPromptOverride: "",
      templatesOverride: "",
      geminiModel: "auto",
      generateAction: "ask",
      theme: "system",
      setGeminiApiKey: (key) => set({ geminiApiKey: key }),
      setRememberApiKey: (remember) => set({ rememberApiKey: remember }),
      setMasterPromptOverride: (value) => set({ masterPromptOverride: value }),
      setMarkdownMasterPromptOverride: (value) => set({ markdownMasterPromptOverride: value }),
      setTemplatesOverride: (value) => set({ templatesOverride: value }),
      resetConfiguration: () => set({ masterPromptOverride: "", markdownMasterPromptOverride: "", templatesOverride: "" }),
      setGeminiModel: (model) => set({ geminiModel: model }),
      setGenerateAction: (action) => set({ generateAction: action }),
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
        markdownMasterPromptOverride: state.markdownMasterPromptOverride,
        templatesOverride: state.templatesOverride,
        geminiModel: state.geminiModel,
        generateAction: state.generateAction,
      }),
    }
  )
);
