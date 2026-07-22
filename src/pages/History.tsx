import { Link, useNavigate } from "react-router-dom";
import { Film, Play, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/useProjectStore";

export default function History() {
  const navigate = useNavigate();
  const { projects, setCurrentProject, deleteProject } = useProjectStore();

  const handleOpenProject = (id: string) => {
    setCurrentProject(id);
    const project = projects.find((item) => item.id === id);
    navigate(project?.scenes.length ? `/results/${id}` : "/builder");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project History</h1>
          <p className="text-muted-foreground mt-1">
            Access your previously generated storyboards.
          </p>
        </div>
        <Link to="/builder" className={buttonVariants()}>
          Create New
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Film className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No history found</h3>
            <p className="text-muted-foreground mb-6">You haven't created any storyboard projects yet.</p>
            <Link to="/builder" className={buttonVariants()}>Start Building</Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="line-clamp-1" title={project.title}>
                      {project.title || "Untitled Project"}
                    </CardTitle>
                    <CardDescription className="mt-1.5 flex flex-wrap gap-2">
                      <Badge variant="secondary" className="text-xs font-normal">
                        {project.settings.movieType || "Project"}
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal">
                        {project.scenes.length} Scenes
                      </Badge>
                      <Badge variant="outline" className="text-xs font-normal">
                        {project.mode === "gemini" ? "AI" : "Static"}
                      </Badge>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {project.settings.storyConcept || "No description provided."}
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Created: {new Date(project.createdAt).toLocaleString()}
                </div>
              </CardContent>
              <CardFooter className="gap-2 pt-4 border-t">
                <Button variant="default" className="w-full gap-2" onClick={() => handleOpenProject(project.id)}>
                  <Play className="w-4 h-4" />
                  Open Project
                </Button>
                <Button variant="outline" size="icon" onClick={() => deleteProject(project.id)} title="Delete">
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
