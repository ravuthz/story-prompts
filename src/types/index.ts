export type AspectRatio =
  | "16:9 Landscape"
  | "9:16 Vertical"
  | "1:1 Square"
  | "4:3 Standard"
  | "3:4 Portrait"
  | "3:2 Cinematic Photo"
  | "2.39:1 Anamorphic";

export type MovieType =
  | "Short Film"
  | "Feature Film"
  | "Micro Drama"
  | "Commercial"
  | "Music Video"
  | "Social Media Video"
  | "YouTube Video"
  | "Documentary"
  | "Animation"
  | "Trailer"
  | "Product Advertisement"
  | "Educational Video"
  | "Horror Short"
  | "Romance Drama"
  | "Action Sequence"
  | "Fantasy Film"
  | "Historical Drama";

export type VisualStyle =
  | "Cinematic Realistic"
  | "Photorealistic"
  | "Hollywood Film"
  | "Korean Drama"
  | "Chinese Micro Drama"
  | "Japanese Cinema"
  | "Anime"
  | "Pixar-inspired 3D"
  | "Stylized 3D Animation"
  | "2D Animation"
  | "Watercolor"
  | "Oil Painting"
  | "Cyberpunk"
  | "Fantasy"
  | "Xianxia"
  | "Historical"
  | "Noir"
  | "Documentary"
  | "Commercial Product Style"
  | "Music Video Style";

export type ShotType =
  | "Extreme Wide Shot"
  | "Wide Shot"
  | "Full Shot"
  | "Medium Wide Shot"
  | "Medium Shot"
  | "Medium Close-Up"
  | "Close-Up"
  | "Extreme Close-Up"
  | "Over-the-Shoulder"
  | "Two Shot"
  | "Group Shot"
  | "Point-of-View Shot"
  | "Insert Shot"
  | "Establishing Shot"
  | "Aerial Shot"
  | "Low-Angle Shot"
  | "High-Angle Shot"
  | "Dutch Angle";

export type CameraMovement =
  | "Static"
  | "Slow Push-In"
  | "Slow Pull-Out"
  | "Dolly In"
  | "Dolly Out"
  | "Tracking Left"
  | "Tracking Right"
  | "Tracking Forward"
  | "Tracking Backward"
  | "Pan Left"
  | "Pan Right"
  | "Tilt Up"
  | "Tilt Down"
  | "Orbit"
  | "Crane Up"
  | "Crane Down"
  | "Handheld"
  | "Steadicam"
  | "Gimbal"
  | "Drone"
  | "Rack Focus"
  | "Zoom In"
  | "Zoom Out";

export interface ProjectSettings {
  title: string;
  storyConcept: string;
  fullSynopsis: string;
  numberOfScenes: number;
  totalDuration: number;
  durationPerScene: number;
  outputLanguage: string;
  aspectRatio: AspectRatio;
  platform: string;
  targetAudience: string;
  movieType: MovieType;
  genre: string;
  tone: string;
  pacing: string;
  narrativeStructure: string;
  endingType: string;

  visualStyle: VisualStyle;
  cinematographyStyle: string;
  colorPalette: string;
  colorGrading: string;
  lightingStyle: string;
  timeOfDay: string;
  weather: string;
  environmentType: string;
  location: string;
  productionDesign: string;
  realismLevel: string;
  imageQuality: string;
  textureDetail: string;
  atmosphere: string;
  mood: string;
  depthOfField: string;
  filmGrain: string;
  lensStyle: string;

  defaultShotType: ShotType;
  allowedShotTypes: ShotType[];
  cameraAngle: string;
  cameraMovement: CameraMovement[];
  cameraStability: string;
  lens: string;
  focalLength: string;
  framing: string;
  composition: string;
  subjectPlacement: string;
  cameraHeight: string;
  cameraSpeed: string;
  focusBehavior: string;
  transitionStyle: string;
  movementDuration: string;
  establishingShotPreference: string;
  closeUpFrequency: string;
  reactionShotFrequency: string;
  insertShotFrequency: string;

  mainCharacters: string;
  supportingCharacters: string;
  characterRelationships: string;
  conflict: string;
  mainGoal: string;
  stakes: string;
  openingScene: string;
  incitingIncident: string;
  midpoint: string;
  climax: string;
  resolution: string;
  dialoguePreference: string;
  narrationPreference: string;
  actionIntensity: string;
  romanceLevel: string;
  comedyLevel: string;
  suspenseLevel: string;
  violenceLevel: string;
  emotionalIntensity: string;
  additionalInstructions: string;

  outputControls: {
    includeSceneTitle: boolean;
    includeSceneSummary: boolean;
    includeStoryBeat: boolean;
    includeCharacterNames: boolean;
    includeFullCharacterDescriptions: boolean;
    includeCharacterContinuity: boolean;
    includeWardrobeContinuity: boolean;
    includeProps: boolean;
    includeEnvironment: boolean;
    includeImagePrompt: boolean;
    includeVideoPrompt: boolean;
    includeNegativePrompt: boolean;
    includeCameraShot: boolean;
    includeCameraAngle: boolean;
    includeCameraMovement: boolean;
    includeLensDetails: boolean;
    includeDuration: boolean;
    includeTimingBreakdown: boolean;
    includeCharacterActions: boolean;
    includeFacialExpressions: boolean;
    includeBodyLanguage: boolean;
    includeDialogue: boolean;
    includeSoundEffects: boolean;
    includeAmbience: boolean;
    includeMusicDirection: boolean;
    includeLighting: boolean;
    includeColorGrading: boolean;
    includeTransition: boolean;
    includeAspectRatio: boolean;
    includeTechnicalQuality: boolean;
    includeAISafetyInstructions: boolean;
    includeConsistencyInstructions: boolean;
  };
}

export interface Character {
  id: string;
  name: string;
  role: string;
  gender: string;
  age: string;
  ethnicityOrAppearance: string;
  faceDescription: string;
  hair: string;
  eyes: string;
  skinTone: string;
  height: string;
  bodyType: string;
  outfit: string;
  accessories: string;
  personality: string;
  emotionalBaseline: string;
  voiceStyle: string;
  movementStyle: string;
  characterReferencePrompt: string;
  continuityNotes: string;
  referenceImageId?: string; // ID for IndexedDB retrieval
}

export interface SceneCharacter {
  characterId: string;
  name: string;
  role: string;
  currentOutfit: string;
  position: string;
  expression: string;
  action: string;
  props: string;
  continuityNotes: string;
}

export interface CameraSettings {
  shotType: string;
  angle: string;
  framing: string;
  lens: string;
  focalLength: string;
  movement: string;
  movementDuration: string;
  stability: string;
  focus: string;
  depthOfField: string;
  composition: string;
  duration: string;
  transition: string;
}

export interface EnvironmentSettings {
  location: string;
  environment: string;
  time: string;
  weather: string;
  lighting: string;
  mood: string;
  colorTone: string;
  productionDesign: string;
  visualStyle: string;
  realism: string;
  texture: string;
  atmosphere: string;
}

export interface AudioSettings {
  dialogue: string;
  narration: string;
  soundEffects: string;
  backgroundAmbience: string;
  music: string;
  voiceDelivery: string;
  lipSyncInstructions: string;
}

export interface TimingSegment {
  timeRange: string;
  description: string;
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  summary: string;
  storyBeat: string;
  purpose: string;
  duration: number;
  location: string;
  timeOfDay: string;
  weather: string;
  characters: SceneCharacter[];
  imagePrompt: string;
  videoPrompt: string;
  negativePrompt: string;
  camera: CameraSettings;
  environment: EnvironmentSettings;
  audio: AudioSettings;
  timing: TimingSegment[];
  continuityNotes: string[];
  previewImageId?: string;
}

export interface StoryboardProject {
  id: string;
  title: string;
  mode: "static" | "gemini";
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  characters: Character[];
  scenes: StoryboardScene[];
}
