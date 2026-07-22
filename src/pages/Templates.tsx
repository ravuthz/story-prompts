import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "@/stores/useProjectStore";
import { ProjectSettings } from "@/types";

const predefinedTemplates: { title: string; description: string; thumbnail: string; settings: Partial<ProjectSettings> }[] = [
  {
    title: "Cinematic Short Film",
    description: "Standard dramatic structure for a 5-scene short film.",
    thumbnail: "/templates/cinematic-short-film.png",
    settings: {
      numberOfScenes: 5,
      movieType: "Short Film",
      genre: "Drama",
      visualStyle: "Cinematic Realistic",
      aspectRatio: "16:9 Landscape"
    }
  },
  {
    title: "Vertical Micro Drama",
    description: "Fast-paced TikTok/Reels format optimized for phone screens.",
    thumbnail: "/templates/vertical-micro-drama.png",
    settings: {
      numberOfScenes: 8,
      movieType: "Micro Drama",
      genre: "Drama",
      visualStyle: "Chinese Micro Drama",
      aspectRatio: "9:16 Vertical",
      durationPerScene: 3,
      pacing: "Fast"
    }
  },
  {
    title: "Music Video",
    description: "Highly stylized, rhythmic cuts with strong visual themes.",
    thumbnail: "/templates/music-video.png",
    settings: {
      numberOfScenes: 10,
      movieType: "Music Video",
      genre: "Music",
      visualStyle: "Music Video Style",
      aspectRatio: "16:9 Landscape",
      colorPalette: "Neon / High Contrast"
    }
  },
  {
    title: "Pixar-inspired Animation",
    description: "Family-friendly 3D style with soft lighting and expressive characters.",
    thumbnail: "/templates/family-animation.png",
    settings: {
      numberOfScenes: 5,
      movieType: "Animation",
      genre: "Family / Adventure",
      visualStyle: "Pixar-inspired 3D",
      aspectRatio: "16:9 Landscape",
      lightingStyle: "Soft and Warm"
    }
  },
  {
    title: "Anime Adventure",
    description: "Epic exploration with expressive heroes and cinematic anime environments.",
    thumbnail: "/templates/anime-adventure.png",
    settings: {
      numberOfScenes: 8,
      movieType: "Animation",
      genre: "Fantasy / Adventure",
      visualStyle: "Anime",
      aspectRatio: "16:9 Landscape",
      pacing: "Dynamic",
      lightingStyle: "Cinematic Sunset",
      colorPalette: "Sky Blue / Coral / Emerald"
    }
  },
  {
    title: "2D Cartoon Comedy",
    description: "Bright slapstick storytelling with fast action and expressive cartoon timing.",
    thumbnail: "/templates/cartoon-comedy.png",
    settings: {
      numberOfScenes: 7,
      movieType: "Animation",
      genre: "Comedy",
      visualStyle: "2D Animation",
      aspectRatio: "16:9 Landscape",
      pacing: "Fast",
      comedyLevel: "High",
      colorPalette: "Bright Primary Colors"
    }
  },
  {
    title: "Watercolor Storybook",
    description: "Gentle illustrated storytelling for magical, emotional, and child-friendly tales.",
    thumbnail: "/templates/watercolor-storybook.png",
    settings: {
      numberOfScenes: 6,
      movieType: "Animation",
      genre: "Family / Fantasy",
      visualStyle: "Watercolor",
      aspectRatio: "16:9 Landscape",
      pacing: "Gentle",
      lightingStyle: "Soft Natural Light",
      textureDetail: "Hand-painted paper texture"
    }
  },
  {
    title: "3D Fantasy Adventure",
    description: "A colorful animated quest with magical worlds, heroes, and friendly creatures.",
    thumbnail: "/templates/3d-fantasy-adventure.png",
    settings: {
      numberOfScenes: 8,
      movieType: "Animation",
      genre: "Fantasy / Adventure",
      visualStyle: "Stylized 3D Animation",
      aspectRatio: "16:9 Landscape",
      pacing: "Energetic",
      lightingStyle: "Magical Cinematic",
      colorPalette: "Violet / Crystal Blue / Gold"
    }
  },
  {
    title: "Stop-Motion Cozy Tale",
    description: "Handcrafted miniature storytelling with tactile characters and warm environments.",
    thumbnail: "/templates/stop-motion-tale.png",
    settings: {
      numberOfScenes: 6,
      movieType: "Animation",
      genre: "Family / Slice of Life",
      visualStyle: "Stylized 3D Animation",
      aspectRatio: "16:9 Landscape",
      pacing: "Gentle",
      productionDesign: "Handcrafted felt, clay, and miniature sets",
      textureDetail: "Visible handmade fibers and tactile materials",
      colorPalette: "Autumn Orange / Mustard / Forest Green"
    }
  }
];

export default function Templates() {
  const navigate = useNavigate();
  const { setCurrentProject } = useProjectStore();

  const handleUseTemplate = (templateSettings: Partial<ProjectSettings>) => {
    // We navigate to builder and pre-fill state if possible, but since we use hook form defaults
    // based on currentProject, it's easier to create a dummy draft project and open it.
    
    // For simplicity, we just clear current project, and in a real app we'd pass state.
    setCurrentProject(null);
    navigate("/builder", { state: { templateSettings } });
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
        <p className="text-muted-foreground mt-1">
          Start quickly with pre-configured project settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {predefinedTemplates.map((template, idx) => (
          <Card key={idx} className="group flex flex-col overflow-hidden transition-colors hover:border-primary/50">
            <div className="aspect-video overflow-hidden bg-muted">
              <img
                src={template.thumbnail}
                alt={`${template.title} template preview`}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                loading="lazy"
              />
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
            <CardFooter className="pt-4 border-t">
              <Button className="w-full gap-2" onClick={() => handleUseTemplate(template.settings)}>
                <Play className="w-4 h-4" /> Use Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
