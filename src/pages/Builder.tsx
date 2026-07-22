import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Wand2, Copy, Key, Settings, Video, Image as ImageIcon, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

import { useProjectStore } from "@/stores/useProjectStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { buildMasterPrompt, generateWithGemini, parseGeminiApiKeys } from "@/services/geminiService";
import { ProjectSettings, StoryboardProject } from "@/types";

const defaultSettings: ProjectSettings = {
  title: "",
  storyConcept: "",
  fullSynopsis: "",
  numberOfScenes: 5,
  totalDuration: 30,
  durationPerScene: 6,
  outputLanguage: "English",
  aspectRatio: "16:9 Landscape",
  platform: "YouTube",
  targetAudience: "General",
  movieType: "Short Film",
  genre: "Drama",
  tone: "Serious",
  pacing: "Moderate",
  narrativeStructure: "Linear",
  endingType: "Resolved",
  
  visualStyle: "Cinematic Realistic",
  cinematographyStyle: "Modern",
  colorPalette: "Moody",
  colorGrading: "Teal and Orange",
  lightingStyle: "Soft",
  timeOfDay: "Day",
  weather: "Clear",
  environmentType: "Urban",
  location: "City",
  productionDesign: "Contemporary",
  realismLevel: "High",
  imageQuality: "8k, masterpiece",
  textureDetail: "High",
  atmosphere: "Neutral",
  mood: "Neutral",
  depthOfField: "Shallow",
  filmGrain: "Low",
  lensStyle: "Standard",

  defaultShotType: "Medium Shot",
  allowedShotTypes: ["Medium Shot", "Close-Up"],
  cameraAngle: "Eye Level",
  cameraMovement: ["Static"],
  cameraStability: "Tripod",
  lens: "35mm",
  focalLength: "Standard",
  framing: "Rule of Thirds",
  composition: "Balanced",
  subjectPlacement: "Center",
  cameraHeight: "Eye Level",
  cameraSpeed: "Normal",
  focusBehavior: "Fixed",
  transitionStyle: "Cut",
  movementDuration: "Full",
  establishingShotPreference: "High",
  closeUpFrequency: "Medium",
  reactionShotFrequency: "Low",
  insertShotFrequency: "Low",

  mainCharacters: "",
  supportingCharacters: "",
  characterRelationships: "",
  conflict: "",
  mainGoal: "",
  stakes: "",
  openingScene: "",
  incitingIncident: "",
  midpoint: "",
  climax: "",
  resolution: "",
  dialoguePreference: "Minimal",
  narrationPreference: "None",
  actionIntensity: "Low",
  romanceLevel: "None",
  comedyLevel: "None",
  suspenseLevel: "Low",
  violenceLevel: "None",
  emotionalIntensity: "Medium",
  additionalInstructions: "",

  outputControls: {
    includeSceneTitle: true,
    includeSceneSummary: true,
    includeStoryBeat: true,
    includeCharacterNames: true,
    includeFullCharacterDescriptions: true,
    includeCharacterContinuity: true,
    includeWardrobeContinuity: true,
    includeProps: true,
    includeEnvironment: true,
    includeImagePrompt: true,
    includeVideoPrompt: true,
    includeNegativePrompt: true,
    includeCameraShot: true,
    includeCameraAngle: true,
    includeCameraMovement: true,
    includeLensDetails: true,
    includeDuration: true,
    includeTimingBreakdown: true,
    includeCharacterActions: true,
    includeFacialExpressions: true,
    includeBodyLanguage: true,
    includeDialogue: true,
    includeSoundEffects: true,
    includeAmbience: true,
    includeMusicDirection: true,
    includeLighting: true,
    includeColorGrading: true,
    includeTransition: true,
    includeAspectRatio: true,
    includeTechnicalQuality: true,
    includeAISafetyInstructions: true,
    includeConsistencyInstructions: true,
  }
};

export default function Builder() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProject, updateProject, getCurrentProject, setCurrentProject } = useProjectStore();
  const geminiApiKey = useSettingsStore(state => state.geminiApiKey);
  const [isGenerating, setIsGenerating] = useState(false);
  const [masterPrompt, setMasterPrompt] = useState("");
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const hasApiKey = parseGeminiApiKeys(geminiApiKey).length > 0;

  const currentProject = getCurrentProject();
  
  const templateSettings = location.state?.templateSettings as Partial<ProjectSettings> | undefined;

  const initialValues = currentProject 
    ? currentProject.settings 
    : templateSettings 
      ? { ...defaultSettings, ...templateSettings }
      : defaultSettings;

  const { register, handleSubmit, control, watch, reset } = useForm<ProjectSettings>({
    defaultValues: initialValues
  });

  // Re-initialize if navigating directly with new state
  useEffect(() => {
    if (templateSettings && !currentProject) {
      reset({ ...defaultSettings, ...templateSettings });
    }
  }, [templateSettings, currentProject, reset]);

  const onSubmit = async (data: ProjectSettings) => {
    setIsGenerating(true);
    const projectId = currentProject?.id || uuidv4();

    try {
      toast.info("Generating with Gemini...");
      const scenes = await generateWithGemini(data, geminiApiKey);
      toast.success("Generated successfully!");

      const project: StoryboardProject = {
        id: projectId,
        title: data.title || "Untitled Project",
        mode: "gemini",
        createdAt: currentProject?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        settings: data,
        characters: currentProject?.characters || [],
        scenes
      };

      if (currentProject) {
        updateProject(projectId, project);
      } else {
        addProject(project);
      }

      setCurrentProject(projectId);
      navigate(`/results/${projectId}`);
    } catch (error: unknown) {
      const err = error as Error;
      toast.error(`Generation failed: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = handleSubmit((data) => {
    if (hasApiKey) {
      return onSubmit(data);
    }
    setMasterPrompt(buildMasterPrompt(data));
    setIsPromptOpen(true);
  });

  const handleCopyPrompt = async () => {
    await navigator.clipboard.writeText(masterPrompt);
    toast.success("Master prompt copied");
  };

  const handleSaveDraft = () => {
    const data = watch();
    const projectId = currentProject?.id || uuidv4();
    
    const project: StoryboardProject = {
      id: projectId,
      title: data.title || "Untitled Draft",
      mode: currentProject?.mode || "static",
      createdAt: currentProject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: data,
      characters: currentProject?.characters || [],
      scenes: currentProject?.scenes || []
    };

    if (currentProject) {
      updateProject(projectId, project);
    } else {
      addProject(project);
      setCurrentProject(projectId);
    }
    
    toast.success("Draft saved to local storage");
  };

  return (
    <div className="p-4 md:p-6 w-full space-y-5 h-full overflow-y-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Storyboard Builder</h1>
        <p className="text-muted-foreground mt-1">Configure your project settings to generate prompts.</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center bg-card border rounded-lg p-4 sticky top-[73px] z-10 shadow-sm">
        <Button variant="outline" onClick={handleSaveDraft} disabled={isGenerating}>Save Draft</Button>
        <Button variant="outline" onClick={() => reset(defaultSettings)} disabled={isGenerating}>Reset Form</Button>
        <div className="flex-1" />
        <Button 
          variant="default"
          onClick={handleCreate}
          disabled={isGenerating}
          className="gap-2"
        >
          {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isGenerating ? "Generating…" : hasApiKey ? "Generate Storyboard" : "Create Master Prompt"}
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4 text-sm shadow-sm">
        <div className="flex items-start gap-3">
          {hasApiKey ? <Wand2 className="mt-0.5 h-5 w-5 text-primary" /> : <Key className="mt-0.5 h-5 w-5 text-muted-foreground" />}
          <div>
            <p className="font-medium">{hasApiKey ? "AI generation is ready" : "No API key — copy-ready mode"}</p>
            <p className="mt-1 text-muted-foreground">
              {hasApiKey
                ? `${parseGeminiApiKeys(geminiApiKey).length} Gemini API key${parseGeminiApiKeys(geminiApiKey).length === 1 ? "" : "s"} configured. The app will try them in order.`
                : "Complete the builder and we’ll create a master prompt you can paste into any AI chat or agent."}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent className="max-h-[88vh] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Your master storyboard prompt</DialogTitle>
            <DialogDescription>
              Paste this into ChatGPT, Gemini, Claude, or another AI agent to generate your storyboard.
            </DialogDescription>
          </DialogHeader>
          <Textarea value={masterPrompt} readOnly className="min-h-[50vh] resize-none font-mono text-xs" />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPromptOpen(false); navigate("/settings"); }} className="gap-2">
              <Key className="h-4 w-4" /> Add API key
            </Button>
            <Button onClick={handleCopyPrompt} className="gap-2">
              <Copy className="h-4 w-4" /> Copy master prompt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <form className="space-y-5">
        <div className="w-full space-y-5 pb-12">
          
          {/* Project Settings */}
          <section className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-4 border-b pb-3">
              <Settings className="w-5 h-5 text-primary" />
                Project & Story Settings
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Project Title</Label>
                  <Input {...register("title")} placeholder="e.g., The Last Horizon" />
                </div>
                <div className="space-y-2">
                  <Label>Number of Scenes</Label>
                  <Input type="number" min={1} max={100} {...register("numberOfScenes", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Story Concept</Label>
                  <Input {...register("storyConcept")} placeholder="A brief one-sentence pitch..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Full Synopsis</Label>
                  <Textarea {...register("fullSynopsis")} rows={4} placeholder="Detailed summary of the story..." />
                </div>
                
                <div className="space-y-2">
                  <Label>Movie or Video Type</Label>
                  <Controller
                    control={control}
                    name="movieType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Short Film">Short Film</SelectItem>
                          <SelectItem value="Feature Film">Feature Film</SelectItem>
                          <SelectItem value="Micro Drama">Micro Drama</SelectItem>
                          <SelectItem value="Commercial">Commercial</SelectItem>
                          <SelectItem value="Music Video">Music Video</SelectItem>
                          <SelectItem value="Animation">Animation</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Aspect Ratio</Label>
                  <Controller
                    control={control}
                    name="aspectRatio"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select ratio" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9 Landscape">16:9 Landscape</SelectItem>
                          <SelectItem value="9:16 Vertical">9:16 Vertical</SelectItem>
                          <SelectItem value="1:1 Square">1:1 Square</SelectItem>
                          <SelectItem value="4:3 Standard">4:3 Standard</SelectItem>
                          <SelectItem value="2.39:1 Anamorphic">2.39:1 Anamorphic</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Genre</Label>
                  <Input {...register("genre")} placeholder="Sci-Fi, Romance, Horror..." />
                </div>
                <div className="space-y-2">
                  <Label>Pacing</Label>
                  <Input {...register("pacing")} placeholder="Fast, Slow burn..." />
                </div>
              </div>
            </div>
          </section>

          {/* Visual Settings */}
          <section className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-4 border-b pb-3">
              <ImageIcon className="w-5 h-5 text-primary" />
                Visual Settings
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Visual Style</Label>
                  <Controller
                    control={control}
                    name="visualStyle"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Cinematic Realistic">Cinematic Realistic</SelectItem>
                          <SelectItem value="Anime">Anime</SelectItem>
                          <SelectItem value="Pixar-inspired 3D">Pixar-inspired 3D</SelectItem>
                          <SelectItem value="Watercolor">Watercolor</SelectItem>
                          <SelectItem value="Cyberpunk">Cyberpunk</SelectItem>
                          <SelectItem value="Noir">Noir</SelectItem>
                          <SelectItem value="Chinese Micro Drama">Chinese Micro Drama</SelectItem>
                          <SelectItem value="Music Video Style">Music Video Style</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color Palette</Label>
                  <Input {...register("colorPalette")} placeholder="Neon, Earth tones..." />
                </div>
                <div className="space-y-2">
                  <Label>Lighting Style</Label>
                  <Input {...register("lightingStyle")} placeholder="High contrast, Soft..." />
                </div>
                <div className="space-y-2">
                  <Label>Time of Day</Label>
                  <Input {...register("timeOfDay")} placeholder="Golden hour, Midnight..." />
                </div>
                <div className="space-y-2">
                  <Label>Weather</Label>
                  <Input {...register("weather")} placeholder="Rainy, Clear, Foggy..." />
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input {...register("location")} placeholder="Abandoned warehouse..." />
                </div>
              </div>
            </div>
          </section>

          {/* Camera Settings */}
          <section className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-4 border-b pb-3">
              <Video className="w-5 h-5 text-primary" />
                Camera & Shot Settings
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Default Shot Type</Label>
                  <Controller
                    control={control}
                    name="defaultShotType"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger><SelectValue placeholder="Select shot" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Wide Shot">Wide Shot</SelectItem>
                          <SelectItem value="Medium Shot">Medium Shot</SelectItem>
                          <SelectItem value="Close-Up">Close-Up</SelectItem>
                          <SelectItem value="Establishing Shot">Establishing Shot</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Camera Angle</Label>
                  <Input {...register("cameraAngle")} placeholder="Low angle, Eye level..." />
                </div>
                <div className="space-y-2">
                  <Label>Lens / Focal Length</Label>
                  <Input {...register("lens")} placeholder="50mm, Wide angle..." />
                </div>
                <div className="space-y-2">
                  <Label>Camera Movement</Label>
                  <Input {...register("cameraMovement.0")} placeholder="Static, Pan left..." />
                </div>
                <div className="space-y-2">
                  <Label>Depth of Field</Label>
                  <Input {...register("depthOfField")} placeholder="Shallow focus..." />
                </div>
                <div className="space-y-2">
                  <Label>Composition</Label>
                  <Input {...register("composition")} placeholder="Rule of thirds..." />
                </div>
              </div>
            </div>
          </section>

          {/* Story Controls */}
          <section className="bg-card border border-border rounded-xl px-4 py-4 shadow-sm">
            <div className="flex items-center gap-2 text-lg font-bold text-foreground mb-4 border-b pb-3">
              <Users className="w-5 h-5 text-primary" />
                Story & Character Controls
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Main Characters</Label>
                  <Textarea {...register("mainCharacters")} placeholder="List main characters..." />
                </div>
                <div className="space-y-2">
                  <Label>Conflict / Goal</Label>
                  <Textarea {...register("conflict")} placeholder="What drives the story..." />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Additional Instructions</Label>
                  <Textarea {...register("additionalInstructions")} placeholder="Any specific requirements for the AI..." />
                </div>
              </div>
            </div>
          </section>
        </div>
      </form>
    </div>
  );
}
