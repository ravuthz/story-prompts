import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import defaultTemplates from "@/config/templates.json";
import { useProjectStore } from "@/stores/useProjectStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { ProjectSettings } from "@/types";

interface StoryboardTemplate {
  title: string;
  description: string;
  thumbnail: string;
  settings: Partial<ProjectSettings>;
}

const getConfiguredTemplates = (override: string): StoryboardTemplate[] => {
  if (!override.trim()) return defaultTemplates as StoryboardTemplate[];
  try {
    const templates = JSON.parse(override) as StoryboardTemplate[];
    const isValid = Array.isArray(templates) && templates.length > 0 && templates.every((template) =>
      typeof template?.title === "string" &&
      typeof template.description === "string" &&
      typeof template.thumbnail === "string" &&
      typeof template.settings === "object" && template.settings !== null
    );
    return isValid ? templates : defaultTemplates as StoryboardTemplate[];
  } catch {
    return defaultTemplates as StoryboardTemplate[];
  }
};

export default function Templates() {
  const navigate = useNavigate();
  const setCurrentProject = useProjectStore(state => state.setCurrentProject);
  const templatesOverride = useSettingsStore(state => state.templatesOverride);
  const templates = getConfiguredTemplates(templatesOverride);

  const handleUseTemplate = (templateSettings: Partial<ProjectSettings>) => {
    setCurrentProject(null);
    navigate("/builder", { state: { templateSettings } });
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.title} className="group flex flex-col overflow-hidden transition-colors hover:border-primary/50">
            <div className="relative aspect-video overflow-hidden bg-muted">
              <img src={template.thumbnail} alt={`${template.title} template preview`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent px-3 pb-3 pt-12">
                <h2 className="text-lg font-semibold text-white drop-shadow-sm">{template.title}</h2>
                <p className="mt-0.5 text-xs leading-snug text-white/80 drop-shadow-sm">{template.description}</p>
              </div>
            </div>
            <CardContent className="flex flex-1 flex-col gap-3 p-3">
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="secondary">{template.settings.movieType}</Badge>
                <Badge variant="outline">{template.settings.aspectRatio}</Badge>
                <Badge variant="outline">{template.settings.visualStyle}</Badge>
              </div>
              <Button size="sm" className="mt-auto w-full gap-2" onClick={() => handleUseTemplate(template.settings)}>
                <Play className="size-4" /> Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
