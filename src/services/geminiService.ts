import { ProjectSettings, StoryboardScene } from "@/types";

export const generateWithGemini = async (settings: ProjectSettings, apiKey: string): Promise<StoryboardScene[]> => {
  if (!apiKey) {
    throw new Error("Gemini API key is required");
  }

  const prompt = `You are an expert storyboard artist, cinematographer, and AI prompt engineer. 
I need you to generate a structured storyboard for a video project.

Project Title: ${settings.title}
Concept: ${settings.storyConcept}
Synopsis: ${settings.fullSynopsis}
Number of Scenes: ${settings.numberOfScenes}
Visual Style: ${settings.visualStyle}
Aspect Ratio: ${settings.aspectRatio}

Generate exactly ${settings.numberOfScenes} scenes. Return the result strictly as a JSON array of objects. 
Do not include markdown blocks like \`\`\`json in your response, just the raw JSON array.

Each object must follow this exact TypeScript interface:
{
  "id": "unique-string",
  "sceneNumber": number,
  "title": "string",
  "summary": "string",
  "storyBeat": "string",
  "purpose": "string",
  "duration": number,
  "location": "string",
  "timeOfDay": "string",
  "weather": "string",
  "characters": [
    {
      "characterId": "string",
      "name": "string",
      "role": "string",
      "currentOutfit": "string",
      "position": "string",
      "expression": "string",
      "action": "string",
      "props": "string",
      "continuityNotes": "string"
    }
  ],
  "imagePrompt": "string (Highly detailed prompt for an AI image generator like Midjourney. Include subject, environment, lighting, camera, style)",
  "videoPrompt": "string (Highly detailed prompt for an AI video generator like Sora, Kling, Runway. Focus on camera movement and character action)",
  "negativePrompt": "string (Things to exclude, comma separated)",
  "camera": {
    "shotType": "string",
    "angle": "string",
    "framing": "string",
    "lens": "string",
    "focalLength": "string",
    "movement": "string",
    "movementDuration": "string",
    "stability": "string",
    "focus": "string",
    "depthOfField": "string",
    "composition": "string",
    "duration": "string",
    "transition": "string"
  },
  "environment": {
    "location": "string",
    "environment": "string",
    "time": "string",
    "weather": "string",
    "lighting": "string",
    "mood": "string",
    "colorTone": "string",
    "productionDesign": "string",
    "visualStyle": "string",
    "realism": "string",
    "texture": "string",
    "atmosphere": "string"
  },
  "audio": {
    "dialogue": "string",
    "narration": "string",
    "soundEffects": "string",
    "backgroundAmbience": "string",
    "music": "string",
    "voiceDelivery": "string",
    "lipSyncInstructions": "string"
  },
  "timing": [
    {
      "timeRange": "string (e.g., '0.0-2.0s')",
      "description": "string"
    }
  ],
  "continuityNotes": ["string"]
}

Ensure the output is valid JSON and strictly follows the schema. Generate exactly ${settings.numberOfScenes} items in the array.`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to generate storyboard from Gemini");
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Received empty response from Gemini");
    }

    const parsed: StoryboardScene[] = JSON.parse(text);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      throw new Error("Invalid format received from Gemini");
    }
    
    return parsed;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};