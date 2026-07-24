import { ProjectSettings, StoryboardScene } from "@/types";
import masterPromptConfig from "@/config/masterPrompt.json";

export const parseGeminiApiKeys = (value: string): string[] =>
  [...new Set(value.split(/[\n,]+/).map((key) => key.trim()).filter(Boolean))];

export interface GeminiModelOption {
  id: string;
  displayName: string;
}

export const listGeminiModels = async (apiKeyInput: string): Promise<GeminiModelOption[]> => {
  const apiKey = parseGeminiApiKeys(apiKeyInput)[0];
  if (!apiKey) return [];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  if (!response.ok) throw new Error("Could not load models for this API key");
  const data = await response.json();
  return (data.models || [])
    .filter((model: { name?: string; supportedGenerationMethods?: string[] }) =>
      model.name && model.supportedGenerationMethods?.includes("generateContent") &&
      !/(embedding|image|tts|live|aqa)/i.test(model.name)
    )
    .map((model: { name: string; displayName?: string }) => ({
      id: model.name.replace(/^models\//, ""),
      displayName: model.displayName || model.name.replace(/^models\//, ""),
    }));
};

export const defaultMasterPromptTemplate = masterPromptConfig.template;
export const defaultMarkdownMasterPromptTemplate = masterPromptConfig.markdownTemplate;

export const buildMasterPrompt = (settings: ProjectSettings, template = defaultMasterPromptTemplate): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = settings[key as keyof ProjectSettings];
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  });

export const buildMarkdownMasterPrompt = (settings: ProjectSettings, template = defaultMarkdownMasterPromptTemplate): string =>
  buildMasterPrompt(settings, template);

const generateWithKey = async (settings: ProjectSettings, apiKey: string, model: string, promptTemplate?: string): Promise<StoryboardScene[]> => {
  const prompt = buildMasterPrompt(settings, promptTemplate);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, responseMimeType: "application/json" }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to generate storyboard from Gemini");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Received empty response from Gemini");

  const parsed: StoryboardScene[] = JSON.parse(text);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("Invalid format received from Gemini");
  }
  return parsed;
};

const rankAutoModels = (models: GeminiModelOption[]) => {
  const preferred = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];
  return [...models].sort((a, b) => {
    const rank = (id: string) => {
      const exact = preferred.indexOf(id);
      if (exact >= 0) return exact;
      if (/flash/i.test(id) && !/preview/i.test(id)) return 10;
      if (/flash/i.test(id)) return 20;
      if (/pro/i.test(id) && !/preview/i.test(id)) return 30;
      return 40;
    };
    return rank(a.id) - rank(b.id);
  });
};

export const generateWithGemini = async (settings: ProjectSettings, apiKeyInput: string, promptTemplate?: string, selectedModel = "auto"): Promise<StoryboardScene[]> => {
  const apiKeys = parseGeminiApiKeys(apiKeyInput);
  if (apiKeys.length === 0) {
    throw new Error("Gemini API key is required");
  }

  let lastError: unknown;
  for (const apiKey of apiKeys) {
    let models: GeminiModelOption[];
    try {
      models = selectedModel === "auto"
        ? rankAutoModels(await listGeminiModels(apiKey))
        : [{ id: selectedModel, displayName: selectedModel }];
    } catch (error) {
      lastError = error;
      continue;
    }
    for (const model of models) {
      try {
        return await generateWithKey(settings, apiKey, model.id, promptTemplate);
      } catch (error) {
        lastError = error;
      }
    }
  }
  console.error("All Gemini API keys failed:", lastError);
  throw lastError instanceof Error ? lastError : new Error("All Gemini API keys failed");
};
