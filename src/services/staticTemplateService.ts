import { ProjectSettings, StoryboardScene, SceneCharacter, TimingSegment } from "@/types";
import { v4 as uuidv4 } from "uuid";

export const generateStaticTemplate = (settings: ProjectSettings): StoryboardScene[] => {
  const scenes: StoryboardScene[] = [];
  const totalScenes = settings.numberOfScenes || 5;
  const durationPerScene = settings.durationPerScene || 5;

  for (let i = 1; i <= totalScenes; i++) {
    let purpose = "Middle Scene - Rising Action";
    let storyBeat = "Conflict / Development";
    if (i === 1) {
      purpose = "Opening Scene - Establish the world and main characters";
      storyBeat = "Hook / Inciting Incident";
    } else if (i === totalScenes) {
      purpose = "Closing Scene - Final resolution and closing image";
      storyBeat = "Climax / Resolution";
    } else if (i === Math.ceil(totalScenes / 2)) {
      purpose = "Midpoint - A significant shift or revelation";
      storyBeat = "Midpoint Escalation";
    }

    const sceneDuration = durationPerScene;
    
    const defaultTiming: TimingSegment[] = [
      { timeRange: `0.0-${(sceneDuration * 0.2).toFixed(1)}s`, description: "Establish the subject and environment." },
      { timeRange: `${(sceneDuration * 0.2).toFixed(1)}-${(sceneDuration * 0.8).toFixed(1)}s`, description: "Main action or character movement." },
      { timeRange: `${(sceneDuration * 0.8).toFixed(1)}-${sceneDuration.toFixed(1)}s`, description: "Ending pose and transition out." }
    ];

    const characters: SceneCharacter[] = [];
    if (settings.mainCharacters) {
      const charNames = settings.mainCharacters.split(',').map(c => c.trim()).filter(Boolean);
      charNames.forEach(name => {
        characters.push({
          characterId: uuidv4(),
          name,
          role: "Main",
          currentOutfit: "Standard outfit",
          position: "Center frame",
          expression: "Neutral to intense",
          action: "Engaging with the scene",
          props: "None",
          continuityNotes: "Maintain consistent face and body type."
        });
      });
    }

    const imagePrompt = `[${settings.visualStyle}] A highly detailed, cinematic shot. 
Main Subject: ${settings.mainCharacters || "A solitary figure"}
Environment: ${settings.location || "A dramatic setting"} - ${settings.environmentType || "Outdoor"}
Time/Lighting: ${settings.timeOfDay || "Golden Hour"}, ${settings.weather || "Clear"}, ${settings.lightingStyle || "Dramatic lighting"}
Mood/Atmosphere: ${settings.mood || "Tense"}, ${settings.atmosphere || "Atmospheric"}
Camera: ${settings.defaultShotType || "Medium Shot"}, ${settings.cameraAngle || "Eye Level"}, ${settings.lensStyle || "Cinematic Lens"}
Details: ${settings.imageQuality || "8k, masterpiece, highly detailed"}, ${settings.textureDetail || "High texture"}
Aspect Ratio: ${settings.aspectRatio}`;

    const videoPrompt = `Camera Movement: ${settings.cameraMovement?.[0] || "Slow Pan"}
Subject Action: The subject performs a subtle movement, looking towards the light.
Environment Dynamics: ${settings.weather || "Subtle wind or atmospheric particles"}.
Focus: ${settings.focusBehavior || "Deep focus"} maintaining clarity.
Continuity: Maintain exact character consistency throughout the motion.
Visuals: High quality, smooth ${settings.imageQuality || "cinematic"} motion.`;

    const negativePrompt = `blurry, low resolution, deformed anatomy, extra fingers, missing fingers, duplicate limbs, duplicate characters, missing characters, inconsistent face, inconsistent hairstyle, inconsistent wardrobe, incorrect accessories, distorted eyes, mutated hands, bad body proportions, floating objects, text, captions, subtitles, logos, watermarks, UI elements, flickering, jittery motion, warped background, sudden camera jumps, unnatural motion, character identity changes`;

    scenes.push({
      id: uuidv4(),
      sceneNumber: i,
      title: `Scene ${i}: ${storyBeat}`,
      summary: `In this scene, the story progresses through ${storyBeat.toLowerCase()}.`,
      storyBeat,
      purpose,
      duration: sceneDuration,
      location: settings.location || "Unknown Location",
      timeOfDay: settings.timeOfDay || "Day",
      weather: settings.weather || "Clear",
      characters,
      imagePrompt,
      videoPrompt,
      negativePrompt,
      camera: {
        shotType: settings.defaultShotType || "Medium Shot",
        angle: settings.cameraAngle || "Eye level",
        framing: settings.framing || "Rule of thirds",
        lens: settings.lens || "35mm",
        focalLength: settings.focalLength || "Standard",
        movement: settings.cameraMovement?.[0] || "Static",
        movementDuration: settings.movementDuration || "Full duration",
        stability: settings.cameraStability || "Tripod",
        focus: settings.focusBehavior || "Deep focus",
        depthOfField: settings.depthOfField || "Medium",
        composition: settings.composition || "Balanced",
        duration: `${sceneDuration}s`,
        transition: settings.transitionStyle || "Cut"
      },
      environment: {
        location: settings.location || "Main Location",
        environment: settings.environmentType || "Standard",
        time: settings.timeOfDay || "Day",
        weather: settings.weather || "Clear",
        lighting: settings.lightingStyle || "Natural",
        mood: settings.mood || "Neutral",
        colorTone: settings.colorPalette || "Standard",
        productionDesign: settings.productionDesign || "Minimal",
        visualStyle: settings.visualStyle || "Cinematic",
        realism: settings.realismLevel || "Photorealistic",
        texture: settings.textureDetail || "High",
        atmosphere: settings.atmosphere || "Clear"
      },
      audio: {
        dialogue: "None",
        narration: "None",
        soundEffects: "Ambient sounds matching the environment",
        backgroundAmbience: "Room tone or outdoor ambience",
        music: "Thematic background score",
        voiceDelivery: "N/A",
        lipSyncInstructions: "No lip sync required"
      },
      timing: defaultTiming,
      continuityNotes: [
        "Maintain the exact same face, hairstyle, body proportions, outfit, accessories, and visual identity across every scene."
      ]
    });
  }

  return scenes;
};