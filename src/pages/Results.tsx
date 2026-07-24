import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Copy, Download, Image as ImageIcon, Video, ArrowLeft, ArrowRight, Settings,
  Edit2, FileText, Clock, Trash2, Sparkles, RefreshCw, X, Film, Users, Sun, Braces
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { HighlightedTextarea } from "@/components/ui/highlighted-textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { toast } from "sonner";

import { useProjectStore } from "@/stores/useProjectStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { exportProjectJSON } from "@/services/exportService";
import { buildMarkdownMasterPrompt } from "@/services/geminiService";
import { StoryboardScene } from "@/types";
import { imageStorage } from "@/services/imageStorage";

export default function Results() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, updateProject, setCurrentProject } = useProjectStore();
  const markdownMasterPromptOverride = useSettingsStore(state => state.markdownMasterPromptOverride);

  const project = projects.find(p => p.id === projectId);
  const markdownMasterPrompt = project
    ? (!project.masterPromptMarkdown || project.masterPromptMarkdown.includes("OUTPUT FORMAT OVERRIDE:")
      ? buildMarkdownMasterPrompt(project.settings, markdownMasterPromptOverride || undefined)
      : project.masterPromptMarkdown)
    : "";

  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [promptFormat, setPromptFormat] = useState<"json" | "markdown">("json");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const sceneParam = searchParams.get("scene");
    if (sceneParam && project) {
      const idx = parseInt(sceneParam) - 1;
      if (idx >= 0 && idx < project.scenes.length) {
        setActiveSceneIndex(idx);
      }
    }
  }, [searchParams, project]);

  const activeScene = project?.scenes[activeSceneIndex];

  useEffect(() => {
    const loadPreview = async () => {
      if (activeScene?.previewImageId) {
        const url = await imageStorage.getImageUrl(activeScene.previewImageId);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    };
    loadPreview();
  }, [activeScene?.previewImageId]);

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
      </div>
    );
  }

  const copyMasterPrompt = async (format: "json" | "markdown") => {
    const prompt = format === "json" ? project.masterPrompt : markdownMasterPrompt;
    if (!prompt) return;
    try {
      await navigator.clipboard.writeText(prompt);
      toast.success(`${format === "json" ? "JSON" : "Markdown"} master prompt copied`);
    } catch {
      toast.error("Could not copy the master prompt");
    }
  };

  if (project.masterPrompt) {
    const previewPrompt = promptFormat === "json"
      ? project.masterPrompt
      : markdownMasterPrompt;

    return (
      <div className="h-full overflow-y-auto bg-muted/20">
        <main className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <FileText className="size-6 text-primary" />
                Master Storyboard Prompt
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Preview and copy a ready-to-use prompt for any AI chat or agent.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" className="gap-2" onClick={() => void copyMasterPrompt("json")}>
                <Braces className="size-4" /> Copy JSON prompt
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => void copyMasterPrompt("markdown")}>
                <FileText className="size-4" /> Copy Markdown prompt
              </Button>
            </div>
          </header>

          <Card className="gap-0 overflow-hidden py-0 shadow-sm">
            <CardHeader className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <CardTitle className="truncate text-base">{project.title}</CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {project.settings.numberOfScenes} scenes · {project.settings.aspectRatio} · {project.settings.visualStyle}
                </p>
              </div>
              <div role="tablist" aria-label="Master prompt format" className="flex rounded-lg bg-muted p-1">
                <Button
                  role="tab"
                  aria-selected={promptFormat === "json"}
                  size="sm"
                  variant={promptFormat === "json" ? "default" : "ghost"}
                  onClick={() => setPromptFormat("json")}
                  className="h-8"
                >
                  JSON
                </Button>
                <Button
                  role="tab"
                  aria-selected={promptFormat === "markdown"}
                  size="sm"
                  variant={promptFormat === "markdown" ? "default" : "ghost"}
                  onClick={() => setPromptFormat("markdown")}
                  className="h-8"
                >
                  Markdown
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <HighlightedTextarea
                mode="prompt"
                value={previewPrompt}
                readOnly
                aria-label={`${promptFormat} master storyboard prompt preview`}
                className="min-h-[60dvh] resize-none bg-muted/20 font-mono text-xs leading-relaxed"
              />
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!activeScene) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center space-y-4 p-8 text-center">
        <h2 className="text-2xl font-bold">Draft ready to continue</h2>
        <p className="max-w-md text-muted-foreground">This project has been saved but does not have generated scenes yet.</p>
        <Button onClick={() => { setCurrentProject(project.id); navigate("/builder"); }}>Continue in Builder</Button>
      </div>
    );
  }

  const handleSceneChange = (index: number) => {
    setActiveSceneIndex(index);
    setSearchParams({ scene: (index + 1).toString() });
  };

  const handleSceneUpdate = (updates: Partial<StoryboardScene>) => {
    const newScenes = [...project.scenes];
    newScenes[activeSceneIndex] = { ...activeScene, ...updates };
    updateProject(project.id, { scenes: newScenes });
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const copyFullScene = () => {
    const text = `SCENE ${String(activeScene.sceneNumber).padStart(2, '0')} — ${activeScene.title.toUpperCase()}\n\nSummary: ${activeScene.summary}\n\nIMAGE PROMPT:\n${activeScene.imagePrompt}\n\nVIDEO PROMPT:\n${activeScene.videoPrompt}\n\nNEGATIVE PROMPT:\n${activeScene.negativePrompt}`;
    handleCopy(text, "Full Scene");
  };

  const copyAllScenes = () => {
    let allText = "";
    project.scenes.forEach(scene => {
      allText += `SCENE ${String(scene.sceneNumber).padStart(2, '0')} — ${scene.title.toUpperCase()}\n\nSummary: ${scene.summary}\n\nIMAGE PROMPT:\n${scene.imagePrompt}\n\nVIDEO PROMPT:\n${scene.videoPrompt}\n\nNEGATIVE PROMPT:\n${scene.negativePrompt}\n\n---\n\n`;
    });
    handleCopy(allText, "All Scenes");
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeScene) return;
    try {
      const imageId = `${project.id}_${activeScene.id}_preview`;
      await imageStorage.saveImage(imageId, file);
      handleSceneUpdate({ previewImageId: imageId });
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast.success("Preview image saved locally");
    } catch {
      toast.error("Failed to save image");
    }
  };

  const handleRemovePreview = async () => {
    if (!activeScene.previewImageId) return;
    await imageStorage.deleteImage(activeScene.previewImageId);
    handleSceneUpdate({ previewImageId: undefined });
    setPreviewUrl(null);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-muted/20">
      {/* Middle Sidebar - Project & Story Settings */}
      <aside className="hidden md:flex w-[280px] bg-card border-r border-border flex-col overflow-y-auto">
        <div className="p-5 flex items-center justify-between sticky top-0 bg-card border-b border-border z-10">
          <h2 className="font-bold text-[15px] text-foreground">Project & Story Settings</h2>
          <Button variant="outline" size="sm" className="h-7 text-xs rounded-full px-3" onClick={() => navigate("/builder")}>Edit</Button>
        </div>

        <div className="p-5 space-y-5 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Edit2 className="w-4 h-4" /> Title</span>
            <span className="font-semibold text-foreground truncate max-w-[120px] text-right" title={project.title}>{project.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><FileText className="w-4 h-4" /> Total Scenes</span>
            <span className="font-semibold text-foreground">{project.scenes.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /> Duration (Total)</span>
            <span className="font-semibold text-foreground">{project.settings.totalDuration} seconds</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Film className="w-4 h-4" /> Movie Type</span>
            <span className="font-semibold text-foreground text-right">{project.settings.movieType} (Live Action)</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Genre / Tone</span>
            <span className="font-semibold text-foreground text-right">{project.settings.genre}, {project.settings.tone}</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Audience</span>
            <span className="font-semibold text-foreground text-right">{project.settings.targetAudience}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Language</span>
            <span className="font-semibold text-foreground">{project.settings.outputLanguage}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Aspect Ratio</span>
            <span className="font-semibold text-foreground">{project.settings.aspectRatio}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Visual Style</span>
            <span className="font-semibold text-foreground truncate max-w-[100px] text-right" title={project.settings.visualStyle}>{project.settings.visualStyle}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Time of Day</span>
            <span className="font-semibold text-foreground">{project.settings.timeOfDay}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Location</span>
            <span className="font-semibold text-foreground truncate max-w-[100px] text-right">{project.settings.location}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-muted-foreground"><Settings className="w-4 h-4" /> Pacing</span>
            <span className="font-semibold text-foreground">{project.settings.pacing}</span>
          </div>
        </div>

        <div className="p-5 mt-auto">
          <Button variant="outline" className="w-full text-muted-foreground gap-2 border-border">
            <RefreshCw className="w-4 h-4" /> View All Settings
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <Sparkles className="w-6 h-6 text-primary" />
                Generated Storyboard Template
              </h1>
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                {project.scenes.length} Scenes • {project.settings.totalDuration} Seconds • {project.settings.movieType}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 gap-2" onClick={copyAllScenes}>
                <Copy className="w-4 h-4" /> Copy All Scenes
              </Button>
              <Button variant="outline" className="text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 gap-2" onClick={() => exportProjectJSON(project)}>
                <Download className="w-4 h-4" /> Export (JSON)
              </Button>
            </div>
          </div>

          {/* Scene Tabs */}
          <div className="bg-card border rounded-xl overflow-hidden flex shadow-sm">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex">
                {project.scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneChange(index)}
                    className={`flex-1 min-w-[120px] px-4 py-2.5 text-sm font-semibold transition-colors border-r last:border-r-0 ${index === activeSceneIndex
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-muted-foreground hover:bg-accent"
                      }`}
                  >
                    Scene {scene.sceneNumber}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" className="invisible" />
            </ScrollArea>
          </div>

          {/* Scene Content Container */}
          <div className="bg-card border rounded-xl shadow-sm p-5 space-y-5 relative">

            {/* Scene Header & Preview */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {/* Info */}
              <div className="min-w-0 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{activeScene.title}</h2>
                </div>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {activeScene.summary}
                </p>

                <div className="w-full overflow-hidden rounded-lg border bg-muted/20 text-sm">
                  <div className="flex items-start justify-between gap-6 border-b p-3">
                    <span className="shrink-0 text-xs font-medium uppercase text-muted-foreground/70">Location</span>
                    <span className="min-w-0 break-words text-right font-semibold text-foreground">{activeScene.location}</span>
                  </div>
                  <div className="flex items-start justify-between gap-6 border-b p-3">
                    <span className="shrink-0 text-xs font-medium uppercase text-muted-foreground/70">Time</span>
                    <span className="min-w-0 break-words text-right font-semibold text-foreground">{activeScene.timeOfDay}</span>
                  </div>
                  <div className="flex items-start justify-between gap-6 border-b p-3">
                    <span className="shrink-0 text-xs font-medium uppercase text-muted-foreground/70">Shot Type</span>
                    <span className="min-w-0 break-words text-right font-semibold text-foreground">{activeScene.camera.shotType}</span>
                  </div>
                  <div className="flex items-start justify-between gap-6 p-3">
                    <span className="shrink-0 text-xs font-medium uppercase text-muted-foreground/70">Duration</span>
                    <span className="min-w-0 break-words text-right font-semibold text-foreground">{activeScene.duration}s</span>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div className="flex min-w-0 flex-col self-stretch overflow-hidden rounded-xl border bg-card">
                <div className="border-b p-3 text-[12px] font-semibold text-foreground">
                  Image Preview <span className="text-muted-foreground/70 font-normal ml-1">(Use Image Prompt to generate)</span>
                </div>
                <div className="flex flex-1 p-3">
                  <div className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/20 xl:min-h-0 xl:flex-1 xl:aspect-auto">
                  {previewUrl ? (
                    <>
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Button variant="destructive" size="sm" onClick={handleRemovePreview} className="gap-2">
                          <Trash2 className="w-4 h-4" /> Remove Preview
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-6 flex flex-col items-center">
                      <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-3">
                        <ImageIcon className="w-8 h-8 text-primary/50" />
                      </div>
                      <h4 className="font-bold text-primary text-sm mb-1">Image Preview</h4>
                      <p className="text-[11px] text-muted-foreground mb-4 max-w-[200px]">Generate using the Image Prompt</p>
                      <Button variant="outline" size="sm" className="bg-card" onClick={() => fileInputRef.current?.click()}>
                        Upload Image
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>

            {/* Prompts Section */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Image Prompt */}
              <Card className="flex flex-col gap-0 border-border py-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-foreground">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    Image Prompt
                  </CardTitle>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-primary" onClick={() => handleCopy(activeScene.imagePrompt, "Image Prompt")}>
                    <Copy className="size-3" /> Copy
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative flex flex-col">
                  <Textarea
                    value={activeScene.imagePrompt}
                    onChange={(e) => handleSceneUpdate({ imagePrompt: e.target.value })}
                    className="min-h-[120px] resize-none border-none bg-transparent p-3 text-[13px] leading-relaxed text-foreground/80 focus-visible:ring-0"
                  />
                </CardContent>
              </Card>

              {/* Video Prompt */}
              <Card className="flex flex-col gap-0 border-border py-0 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-3">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-foreground">
                    <Video className="w-4 h-4 text-primary" />
                    Video Prompt
                  </CardTitle>
                  <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-primary" onClick={() => handleCopy(activeScene.videoPrompt, "Video Prompt")}>
                    <Copy className="size-3" /> Copy
                  </Button>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative flex flex-col">
                  <Textarea
                    value={activeScene.videoPrompt}
                    onChange={(e) => handleSceneUpdate({ videoPrompt: e.target.value })}
                    className="min-h-[120px] resize-none border-none bg-transparent p-3 text-[13px] leading-relaxed text-foreground/80 focus-visible:ring-0"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Technical Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">

              {/* Camera */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-foreground uppercase tracking-wider">
                  <Settings className="w-4 h-4 text-primary" /> Camera & Shot Settings
                </h4>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Shot Type</span> <span className="font-semibold text-foreground">{activeScene.camera.shotType}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Camera Angle</span> <span className="font-semibold text-foreground">{activeScene.camera.angle}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Lens</span> <span className="font-semibold text-foreground">{activeScene.camera.lens}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Movement</span> <span className="font-semibold text-foreground">{activeScene.camera.movement}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Stability</span> <span className="font-semibold text-foreground">{activeScene.camera.stability}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground font-medium">Duration</span> <span className="font-semibold text-foreground">{activeScene.camera.duration}</span></div>
                </div>
              </div>

              {/* Characters */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-foreground uppercase tracking-wider">
                  <Users className="w-4 h-4 text-primary" /> Characters & Continuity
                </h4>
                <div className="space-y-3 text-[13px]">
                  {activeScene.characters.slice(0, 4).map((char, i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <span className="text-muted-foreground font-medium whitespace-nowrap mr-4">{char.role || char.name}</span>
                      <span className="font-semibold text-foreground text-right truncate" title={char.name}>{char.name}</span>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-muted-foreground font-medium">Consistency</span>
                    <span className="font-semibold text-foreground text-xs leading-tight line-clamp-3">Keep same appearance. {activeScene.continuityNotes[0]}</span>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-foreground uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-primary" /> Environment & Style
                </h4>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Location</span> <span className="font-semibold text-foreground text-right line-clamp-1">{activeScene.environment.location}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Lighting</span> <span className="font-semibold text-foreground text-right line-clamp-1">{activeScene.environment.lighting}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Weather</span> <span className="font-semibold text-foreground text-right line-clamp-1">{activeScene.environment.weather}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Mood</span> <span className="font-semibold text-foreground text-right line-clamp-1">{activeScene.environment.mood}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-muted-foreground font-medium">Color Tone</span> <span className="font-semibold text-foreground text-right line-clamp-1">{activeScene.environment.colorTone}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground font-medium">Visual Style</span> <span className="font-semibold text-foreground text-right line-clamp-1">{activeScene.environment.visualStyle}</span></div>
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-foreground uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-red-500" /> Negative Prompt <span className="text-muted-foreground font-normal normal-case tracking-normal text-[10px] ml-1">(Exclude)</span>
                </h4>
                <div className="space-y-2 text-[13px]">
                  {activeScene.negativePrompt.split(',').slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-muted-foreground leading-tight">{item.trim()}</span>
                    </div>
                  ))}
                  {activeScene.negativePrompt.split(',').length > 5 && (
                    <div className="text-muted-foreground/70 italic text-xs pl-5">...and more</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pb-10">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground gap-2"
              onClick={() => handleSceneChange(Math.max(0, activeSceneIndex - 1))}
              disabled={activeSceneIndex === 0}
            >
              <ArrowLeft className="w-4 h-4" /> Previous Scene
            </Button>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="gap-2 px-4 font-semibold text-primary hover:text-primary">
                <RefreshCw className="w-4 h-4" /> Regenerate Template
              </Button>
              <Button variant="outline" className="gap-2 px-4 font-semibold text-primary hover:text-primary" onClick={copyFullScene}>
                <Copy className="w-4 h-4" /> Copy Full Scene
              </Button>
            </div>

            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/80 gap-2 px-8 font-semibold"
              onClick={() => handleSceneChange(Math.min(project.scenes.length - 1, activeSceneIndex + 1))}
              disabled={activeSceneIndex === project.scenes.length - 1}
            >
              Next Scene <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
