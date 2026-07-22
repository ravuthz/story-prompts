import { Link, useNavigate } from "react-router-dom";
import { Film, Plus, Clock, Trash2, Play } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/stores/useProjectStore";
export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, setCurrentProject, deleteProject } = useProjectStore();

  const handleCreateNew = () => {
    setCurrentProject(null);
    navigate("/builder");
  };

  const handleOpenProject = (id: string) => {
    setCurrentProject(id);
    const project = projects.find((item) => item.id === id);
    navigate(project?.scenes.length ? `/results/${id}` : "/builder");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 md:col-span-2 border-primary/20 shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle>Create New Storyboard</CardTitle>
            <CardDescription>Start a new project from scratch or use a template.</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button size="lg" onClick={handleCreateNew} className="gap-2">
              <Plus className="w-5 h-5" />
              New Project
            </Button>
            <Link to="/templates" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "gap-2 bg-background")}>
              <Film className="w-5 h-5" />
              Browse Templates
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Projects</span>
              <span className="font-bold text-xl">{projects.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Generated Scenes</span>
              <span className="font-bold text-xl">
                {projects.reduce((acc, proj) => acc + proj.scenes.length, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Recent Projects</h2>
        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Film className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-6">Create your first storyboard to see it here.</p>
              <Button onClick={handleCreateNew}>Create Project</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 6).map((project) => (
              <Card key={project.id} className="flex flex-col hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <CardTitle className="line-clamp-1" title={project.title}>
                        {project.title || "Untitled Project"}
                      </CardTitle>
                      <CardDescription className="mt-1.5 flex gap-2">
                        <Badge variant="secondary" className="text-xs font-normal">
                          {project.settings.movieType || "Project"}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          {project.scenes.length} Scenes
                        </Badge>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="text-xs text-muted-foreground">
                    Last edited: {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
                <CardFooter className="gap-2 pt-4 border-t">
                  <Button variant="default" className="w-full gap-2" onClick={() => handleOpenProject(project.id)}>
                    <Play className="w-4 h-4" />
                    Open
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
    </div>
  );
}
