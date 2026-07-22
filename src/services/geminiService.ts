import { ProjectSettings, StoryboardScene } from "@/types";
import masterPromptConfig from "@/config/masterPrompt.json";

export const parseGeminiApiKeys = (value: string): string[] =>
  [...new Set(value.split(/[\n,]+/).map((key) => key.trim()).filter(Boolean))];

export const defaultMasterPromptTemplate = masterPromptConfig.template;

export const buildMasterPrompt = (settings: ProjectSettings, template = defaultMasterPromptTemplate): string =>
  template.replace(/\{\{(\w+)\}\}/g, (_match, key: string) => {
    const value = settings[key as keyof ProjectSettings];
    return typeof value === "string" || typeof value === "number" ? String(value) : "";
  });

const generateWithKey = async (settings: ProjectSettings, apiKey: string, promptTemplate?: string): Promise<StoryboardScene[]> => {
  const prompt = buildMasterPrompt(settings, promptTemplate);

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
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

export const generateWithGemini = async (settings: ProjectSettings, apiKeyInput: string, promptTemplate?: string): Promise<StoryboardScene[]> => {
  const apiKeys = parseGeminiApiKeys(apiKeyInput);
  if (apiKeys.length === 0) {
    throw new Error("Gemini API key is required");
  }

  let lastError: unknown;
  for (const apiKey of apiKeys) {
    try {
      return await generateWithKey(settings, apiKey, promptTemplate);
    } catch (error) {
      lastError = error;
    }
  }
  console.error("All Gemini API keys failed:", lastError);
  throw lastError instanceof Error ? lastError : new Error("All Gemini API keys failed");
};
