import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Copy, Image as ImageIcon, Video, ArrowLeft, ArrowRight, Settings, Plus, Edit2, ChevronLeft, FileText, Clock, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { useProjectStore } from "@/stores/useProjectStore";
import { exportProjectJSON, exportProjectTXT, exportProjectMarkdown } from "@/services/exportService";
import { StoryboardScene } from "@/types";
import { imageStorage } from "@/services/imageStorage";

export default function Results() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { projects, updateProject } = useProjectStore();
  
  const project = projects.find(p => p.id === projectId);
  
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
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

  if (!project || !activeScene) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground">The requested storyboard project does not exist or was deleted.</p>
        <Button onClick={() => navigate("/")}>Return to Dashboard</Button>
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
    const text = `SCENE ${String(activeScene.sceneNumber).padStart(2, '0')} — ${activeScene.title.toUpperCase()}

Summary: ${activeScene.summary}

IMAGE PROMPT:
${activeScene.imagePrompt}

VIDEO PROMPT:
${activeScene.videoPrompt}

NEGATIVE PROMPT:
${activeScene.negativePrompt}`;
    handleCopy(text, "Full Scene");
  };

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
    } catch (err) {
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
    <div className="flex flex-col md:flex-row h-full min-h-[calc(100vh-64px)]">
      {/* Left Sidebar - Project Summary */}
      <aside className="w-full md:w-64 lg:w-72 border-r bg-card/50 p-6 flex flex-col h-[calc(100vh-64px)] overflow-y-auto shrink-0 sticky top-0 md:top-16">
        <div className="space-y-6">
          <div>
            <Button variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground" onClick={() => navigate("/")}>
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h2 className="text-xl font-bold line-clamp-2">{project.title}</h2>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant="secondary">{project.settings.movieType}</Badge>
              <Badge variant="outline">{project.scenes.length} Scenes</Badge>
              <Badge variant="outline">{project.mode === "gemini" ? "AI Generated" : "Static Template"}</Badge>
            </div>
          </div>

          <Separator />

          <div className="space-y-3 text-sm">
            <h3 className="font-semibold">Project Details</h3>
            <div className="grid grid-cols-2 gap-2 text-muted-foreground">
              <span>Duration:</span> <span className="text-foreground">{project.settings.totalDuration}s</span>
              <span>Ratio:</span> <span className="text-foreground">{project.settings.aspectRatio}</span>
              <span>Style:</span> <span className="text-foreground line-clamp-1" title={project.settings.visualStyle}>{project.settings.visualStyle}</span>
              <span>Genre:</span> <span className="text-foreground">{project.settings.genre}</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/builder")}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Settings
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => exportProjectJSON(project)}>
              <FileText className="w-4 h-4 mr-2" /> Export JSON
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => exportProjectTXT(project)}>
              <FileText className="w-4 h-4 mr-2" /> Export TXT
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => exportProjectMarkdown(project)}>
              <FileText className="w-4 h-4 mr-2" /> Export MD
            </Button>
          </div>

          <div className="mt-auto pt-8">
            <p className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded-md">
              All Data Stored Locally
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background">
        {/* Horizontal Scene Tabs */}
        <div className="border-b bg-card sticky top-0 md:top-16 z-20">
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex p-2 gap-1">
              {project.scenes.map((scene, index) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneChange(index)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    index === activeSceneIndex
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  Scene {scene.sceneNumber}
                </button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b bg-muted/20">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSceneChange(Math.max(0, activeSceneIndex - 1))}
              disabled={activeSceneIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleSceneChange(Math.min(project.scenes.length - 1, activeSceneIndex + 1))}
              disabled={activeSceneIndex === project.scenes.length - 1}
            >
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={copyFullScene}>
              <Copy className="w-4 h-4 mr-2" /> Copy Full Scene
            </Button>
          </div>
        </div>

        {/* Workspace */}
        {activeScene && (
          <div className="p-4 md:p-6 lg:p-8 overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
            
            {/* Scene Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 text-lg px-3 py-1">
                  Scene {String(activeScene.sceneNumber).padStart(2, '0')}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-bold">{activeScene.title}</h1>
              </div>
              <p className="text-lg text-muted-foreground">{activeScene.summary}</p>
              
              <div className="flex flex-wrap gap-4 pt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {activeScene.duration}s</span>
                <span className="flex items-center gap-1.5"><Settings className="w-4 h-4" /> {activeScene.camera.shotType}</span>
                <span className="flex items-center gap-1.5">{activeScene.timeOfDay} • {activeScene.location}</span>
              </div>
            </div>

            {/* Image Preview Placeholder */}
            <Card className="border-dashed bg-muted/10 overflow-hidden relative">
              <CardContent className="p-0 flex flex-col items-center justify-center text-center min-h-[300px]">
                {previewUrl ? (
                  <div className="relative w-full h-full group">
                    <img src={previewUrl} alt="Scene Preview" className="w-full h-auto object-cover max-h-[600px]" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button variant="destructive" size="sm" onClick={handleRemovePreview}>
                        <Trash2 className="w-4 h-4 mr-2" /> Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-12 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <ImageIcon className="w-10 h-10 text-primary/60" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Image Preview</h3>
                    <p className="text-muted-foreground max-w-md mb-6">
                      Generate using the Image Prompt below in your preferred AI tool, then you can upload it here to preview.
                    </p>
                    <Button variant="outline" className="gap-2" onClick={() => fileInputRef.current?.click()}>
                      <Plus className="w-4 h-4" /> Upload Local Preview
                    </Button>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      accept="image/png, image/jpeg, image/webp" 
                      className="hidden" 
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Prompt */}
              <Card className="flex flex-col shadow-sm border-primary/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-primary/5 rounded-t-lg">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-primary" />
                      IMAGE PROMPT
                    </CardTitle>
                    <CardDescription>For Midjourney, Stable Diffusion, etc.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(activeScene.imagePrompt, "Image Prompt")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <Textarea 
                    value={activeScene.imagePrompt}
                    onChange={(e) => handleSceneUpdate({ imagePrompt: e.target.value })}
                    className="min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                  />
                </CardContent>
              </Card>

              {/* Video Prompt */}
              <Card className="flex flex-col shadow-sm border-purple-500/20">
                <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0 bg-purple-500/5 rounded-t-lg">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      VIDEO PROMPT
                    </CardTitle>
                    <CardDescription>For Sora, Kling, Runway, Veo, etc.</CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(activeScene.videoPrompt, "Video Prompt")}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-4 flex-1">
                  <Textarea 
                    value={activeScene.videoPrompt}
                    onChange={(e) => handleSceneUpdate({ videoPrompt: e.target.value })}
                    className="min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Negative Prompt */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base font-semibold">NEGATIVE PROMPT</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleCopy(activeScene.negativePrompt, "Negative Prompt")}>
                  <Copy className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <Textarea 
                  value={activeScene.negativePrompt}
                  onChange={(e) => handleSceneUpdate({ negativePrompt: e.target.value })}
                  className="min-h-[100px] font-mono text-sm"
                />
              </CardContent>
            </Card>

            {/* Technical Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Camera & Shot Settings */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Camera & Shot</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Shot Type</span>
                      <span className="font-medium">{activeScene.camera.shotType}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Movement</span>
                      <span className="font-medium">{activeScene.camera.movement}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Angle</span>
                      <span className="font-medium">{activeScene.camera.angle}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Lens</span>
                      <span className="font-medium">{activeScene.camera.lens}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Environment */}
              <Card className="shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Environment & Style</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Location</span>
                      <span className="font-medium">{activeScene.environment.location}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Time/Weather</span>
                      <span className="font-medium">{activeScene.environment.time}, {activeScene.environment.weather}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Lighting</span>
                      <span className="font-medium">{activeScene.environment.lighting}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Style</span>
                      <span className="font-medium">{activeScene.environment.visualStyle}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Characters Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Characters & Continuity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeScene.characters.map((char, i) => (
                    <div key={i} className="bg-muted/30 p-3 rounded-md border">
                      <div className="font-semibold">{char.name} <span className="text-muted-foreground font-normal text-sm">({char.role})</span></div>
                      <div className="text-sm mt-1">
                        <span className="text-muted-foreground">Action:</span> {char.action}
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-muted-foreground">Expression:</span> {char.expression}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-semibold mb-2">Continuity Notes:</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {activeScene.continuityNotes.map((note, i) => (
                        <li key={i}>{note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}