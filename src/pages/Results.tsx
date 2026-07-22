import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import {
  Copy, Download, Image as ImageIcon, Video, ArrowLeft, ArrowRight, Settings,
  Edit2, FileText, Clock, Trash2, Sparkles, RefreshCw, X, Film, Users, Sun
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

import { useProjectStore } from "@/stores/useProjectStore";
import { exportProjectJSON } from "@/services/exportService";
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
    <div className="flex h-full w-full overflow-hidden bg-[#F8FAFC]">
      {/* Middle Sidebar - Project & Story Settings */}
      <aside className="hidden md:flex w-[280px] bg-white border-r border-slate-200 flex-col overflow-y-auto">
        <div className="p-5 flex items-center justify-between sticky top-0 bg-white border-b border-slate-100 z-10">
          <h2 className="font-bold text-[15px] text-slate-900">Project & Story Settings</h2>
          <Button variant="outline" size="sm" className="h-7 text-xs rounded-full px-3" onClick={() => navigate("/builder")}>Edit</Button>
        </div>

        <div className="p-5 space-y-5 text-[13px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500"><Edit2 className="w-4 h-4" /> Title</span>
            <span className="font-semibold text-slate-900 truncate max-w-[120px] text-right" title={project.title}>{project.title}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500"><FileText className="w-4 h-4" /> Total Scenes</span>
            <span className="font-semibold text-slate-900">{project.scenes.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-slate-500"><Clock className="w-4 h-4" /> Duration (Total)</span>
            <span className="font-semibold text-slate-900">{project.settings.totalDuration} seconds</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Film className="w-4 h-4" /> Movie Type</span>
            <span className="font-semibold text-slate-900 text-right">{project.settings.movieType} (Live Action)</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Genre / Tone</span>
            <span className="font-semibold text-slate-900 text-right">{project.settings.genre}, {project.settings.tone}</span>
          </div>
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Audience</span>
            <span className="font-semibold text-slate-900 text-right">{project.settings.targetAudience}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Language</span>
            <span className="font-semibold text-slate-900">{project.settings.outputLanguage}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Aspect Ratio</span>
            <span className="font-semibold text-slate-900">{project.settings.aspectRatio}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Visual Style</span>
            <span className="font-semibold text-slate-900 truncate max-w-[100px] text-right" title={project.settings.visualStyle}>{project.settings.visualStyle}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Time of Day</span>
            <span className="font-semibold text-slate-900">{project.settings.timeOfDay}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Location</span>
            <span className="font-semibold text-slate-900 truncate max-w-[100px] text-right">{project.settings.location}</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="flex items-center gap-2 text-slate-500"><Settings className="w-4 h-4" /> Pacing</span>
            <span className="font-semibold text-slate-900">{project.settings.pacing}</span>
          </div>
        </div>

        <div className="p-5 mt-auto">
          <Button variant="outline" className="w-full text-slate-600 gap-2 border-slate-200">
            <RefreshCw className="w-4 h-4" /> View All Settings
          </Button>
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full space-y-6">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                <Sparkles className="w-6 h-6 text-[#5436D6]" />
                Generated Storyboard Template
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                {project.scenes.length} Scenes • {project.settings.totalDuration} Seconds • {project.settings.movieType}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="text-[#5436D6] border-[#5436D6]/20 bg-[#5436D6]/5 hover:bg-[#5436D6]/10 gap-2" onClick={copyAllScenes}>
                <Copy className="w-4 h-4" /> Copy All Scenes
              </Button>
              <Button variant="outline" className="text-[#5436D6] border-[#5436D6]/20 bg-[#5436D6]/5 hover:bg-[#5436D6]/10 gap-2" onClick={() => exportProjectJSON(project)}>
                <Download className="w-4 h-4" /> Export (JSON)
              </Button>
            </div>
          </div>

          {/* Scene Tabs */}
          <div className="bg-white border rounded-xl overflow-hidden flex shadow-sm">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex">
                {project.scenes.map((scene, index) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneChange(index)}
                    className={`flex-1 min-w-[120px] px-6 py-4 text-sm font-semibold transition-colors border-r last:border-r-0 ${index === activeSceneIndex
                      ? "bg-[#5436D6] text-white"
                      : "text-slate-600 hover:bg-slate-50 bg-white"
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
          <div className="bg-white border rounded-xl shadow-sm p-8 space-y-8 relative">

            {/* Scene Header & Preview */}
            <div className="flex flex-col xl:flex-row gap-8">
              {/* Info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <Badge className="bg-[#5436D6]/10 text-[#5436D6] hover:bg-[#5436D6]/20 text-lg px-4 py-1.5 rounded-lg border-none shadow-none font-semibold">
                    Scene {activeScene.sceneNumber}
                  </Badge>
                  <h2 className="text-2xl font-bold text-slate-900">{activeScene.title}</h2>
                </div>
                <p className="text-[15px] leading-relaxed text-slate-600">
                  {activeScene.summary}
                </p>

                <div className="flex gap-4 pt-2">
                  <div className="bg-[#F8FAFC] border rounded-lg p-3 min-w-[100px]">
                    <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Location</div>
                    <div className="font-semibold text-sm">{activeScene.location}</div>
                  </div>
                  <div className="bg-[#F8FAFC] border rounded-lg p-3 min-w-[100px]">
                    <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Time</div>
                    <div className="font-semibold text-sm">{activeScene.timeOfDay}</div>
                  </div>
                  <div className="bg-[#F8FAFC] border rounded-lg p-3 min-w-[100px]">
                    <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Shot Type</div>
                    <div className="font-semibold text-sm">{activeScene.camera.shotType}</div>
                  </div>
                  <div className="bg-[#F8FAFC] border rounded-lg p-3 min-w-[100px]">
                    <div className="text-[11px] text-slate-400 font-medium uppercase mb-1">Duration</div>
                    <div className="font-semibold text-sm">{activeScene.duration}s</div>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              <div className="xl:w-[500px] shrink-0">
                <div className="text-[12px] font-semibold text-slate-900 mb-2">
                  Image Preview <span className="text-slate-400 font-normal ml-1">(Use Image Prompt to generate)</span>
                </div>
                <div className="relative w-full aspect-video bg-[#F8FAFC] rounded-xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center group">
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
                      <div className="w-16 h-16 bg-[#5436D6]/5 rounded-2xl flex items-center justify-center mb-3">
                        <ImageIcon className="w-8 h-8 text-[#5436D6]/50" />
                      </div>
                      <h4 className="font-bold text-[#5436D6] text-sm mb-1">Image Preview</h4>
                      <p className="text-[11px] text-slate-500 mb-4 max-w-[200px]">Generate using the Image Prompt</p>
                      <Button variant="outline" size="sm" className="bg-white" onClick={() => fileInputRef.current?.click()}>
                        Upload Image
                      </Button>
                      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Prompts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Prompt */}
              <Card className="shadow-sm border-slate-200 flex flex-col">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-900">
                    <ImageIcon className="w-4 h-4 text-[#5436D6]" />
                    Image Prompt <span className="text-slate-500 font-normal normal-case tracking-normal text-xs ml-1">(for Still Image)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative flex flex-col">
                  <Textarea
                    value={activeScene.imagePrompt}
                    onChange={(e) => handleSceneUpdate({ imagePrompt: e.target.value })}
                    className="min-h-[180px] p-5 border-none resize-none focus-visible:ring-0 text-[13px] leading-relaxed text-slate-700 bg-transparent"
                  />
                  <div className="p-4 flex justify-end border-t border-slate-50 bg-slate-50/50 mt-auto">
                    <Button variant="outline" size="sm" className="text-[#5436D6] border-[#5436D6]/20 bg-white gap-2" onClick={() => handleCopy(activeScene.imagePrompt, "Image Prompt")}>
                      <Copy className="w-3 h-3" /> Copy Image Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Video Prompt */}
              <Card className="shadow-sm border-slate-200 flex flex-col">
                <CardHeader className="p-4 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider text-slate-900">
                    <Video className="w-4 h-4 text-[#5436D6]" />
                    Video Prompt <span className="text-slate-500 font-normal normal-case tracking-normal text-xs ml-1">(for Motion)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative flex flex-col">
                  <Textarea
                    value={activeScene.videoPrompt}
                    onChange={(e) => handleSceneUpdate({ videoPrompt: e.target.value })}
                    className="min-h-[180px] p-5 border-none resize-none focus-visible:ring-0 text-[13px] leading-relaxed text-slate-700 bg-transparent"
                  />
                  <div className="p-4 flex justify-end border-t border-slate-50 bg-slate-50/50 mt-auto">
                    <Button variant="outline" size="sm" className="text-[#5436D6] border-[#5436D6]/20 bg-white gap-2" onClick={() => handleCopy(activeScene.videoPrompt, "Video Prompt")}>
                      <Copy className="w-3 h-3" /> Copy Video Prompt
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Technical Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">

              {/* Camera */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-slate-900 uppercase tracking-wider">
                  <Settings className="w-4 h-4 text-[#5436D6]" /> Camera & Shot Settings
                </h4>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Shot Type</span> <span className="font-semibold text-slate-900">{activeScene.camera.shotType}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Camera Angle</span> <span className="font-semibold text-slate-900">{activeScene.camera.angle}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Lens</span> <span className="font-semibold text-slate-900">{activeScene.camera.lens}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Movement</span> <span className="font-semibold text-slate-900">{activeScene.camera.movement}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Stability</span> <span className="font-semibold text-slate-900">{activeScene.camera.stability}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Duration</span> <span className="font-semibold text-slate-900">{activeScene.camera.duration}</span></div>
                </div>
              </div>

              {/* Characters */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-slate-900 uppercase tracking-wider">
                  <Users className="w-4 h-4 text-[#5436D6]" /> Characters & Continuity
                </h4>
                <div className="space-y-3 text-[13px]">
                  {activeScene.characters.slice(0, 4).map((char, i) => (
                    <div key={i} className="flex justify-between border-b pb-2">
                      <span className="text-slate-500 font-medium whitespace-nowrap mr-4">{char.role || char.name}</span>
                      <span className="font-semibold text-slate-900 text-right truncate" title={char.name}>{char.name}</span>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 pt-1">
                    <span className="text-slate-500 font-medium">Consistency</span>
                    <span className="font-semibold text-slate-900 text-xs leading-tight line-clamp-3">Keep same appearance. {activeScene.continuityNotes[0]}</span>
                  </div>
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-slate-900 uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-[#5436D6]" /> Environment & Style
                </h4>
                <div className="space-y-3 text-[13px]">
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Location</span> <span className="font-semibold text-slate-900 text-right line-clamp-1">{activeScene.environment.location}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Lighting</span> <span className="font-semibold text-slate-900 text-right line-clamp-1">{activeScene.environment.lighting}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Weather</span> <span className="font-semibold text-slate-900 text-right line-clamp-1">{activeScene.environment.weather}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Mood</span> <span className="font-semibold text-slate-900 text-right line-clamp-1">{activeScene.environment.mood}</span></div>
                  <div className="flex justify-between border-b pb-2"><span className="text-slate-500 font-medium">Color Tone</span> <span className="font-semibold text-slate-900 text-right line-clamp-1">{activeScene.environment.colorTone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500 font-medium">Visual Style</span> <span className="font-semibold text-slate-900 text-right line-clamp-1">{activeScene.environment.visualStyle}</span></div>
                </div>
              </div>

              {/* Negative Prompt */}
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-sm text-slate-900 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-red-500" /> Negative Prompt <span className="text-slate-500 font-normal normal-case tracking-normal text-[10px] ml-1">(Exclude)</span>
                </h4>
                <div className="space-y-2 text-[13px]">
                  {activeScene.negativePrompt.split(',').slice(0, 5).map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <X className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                      <span className="text-slate-600 leading-tight">{item.trim()}</span>
                    </div>
                  ))}
                  {activeScene.negativePrompt.split(',').length > 5 && (
                    <div className="text-slate-400 italic text-xs pl-5">...and more</div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="flex items-center justify-between pb-10">
            <Button
              variant="ghost"
              className="text-slate-500 hover:text-slate-900 gap-2"
              onClick={() => handleSceneChange(Math.max(0, activeSceneIndex - 1))}
              disabled={activeSceneIndex === 0}
            >
              <ArrowLeft className="w-4 h-4" /> Previous Scene
            </Button>

            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-slate-200 text-[#5436D6] hover:text-[#5436D6] hover:bg-slate-50 gap-2 font-semibold px-6">
                <RefreshCw className="w-4 h-4" /> Regenerate Template
              </Button>
              <Button variant="outline" className="border-slate-200 text-[#5436D6] hover:text-[#5436D6] hover:bg-slate-50 gap-2 font-semibold px-6" onClick={copyFullScene}>
                <Copy className="w-4 h-4" /> Copy Full Scene
              </Button>
            </div>

            <Button
              className="bg-[#5436D6] hover:bg-[#4323c0] text-white gap-2 px-8 font-semibold"
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