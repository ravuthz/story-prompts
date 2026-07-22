import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
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
            <div className="aspect-video overflow-hidden bg-muted">
              <img src={template.thumbnail} alt={`${template.title} template preview`} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
            </div>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{template.title}</CardTitle>
              <CardDescription className="mt-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{template.settings.movieType}</Badge>
                <Badge variant="outline">{template.settings.aspectRatio}</Badge>
                <Badge variant="outline">{template.settings.visualStyle}</Badge>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4">
              <Button className="w-full gap-2" onClick={() => handleUseTemplate(template.settings)}>
                <Play className="size-4" /> Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
