import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, HardDrive, Zap, Code } from "lucide-react";

export default function About() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">About Storyboard Builder</h1>
        <p className="text-muted-foreground mt-1">
          Create AI Video Storyboard Prompts in Seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 shadow-sm bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              100% Local & Private
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            There is no backend database, no login, and no user tracking. All your projects, characters, and settings are stored locally in your browser's LocalStorage and IndexedDB. You own your data.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Two Generation Modes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Use the <strong>Static Template Builder</strong> to generate deterministic prompt structures offline, or plug in your own <strong>Gemini API Key</strong> to have Google's AI write detailed scene-by-scene prompts for you.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-green-500" />
              Data Export
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            Since your data is locked to your current browser, we provide easy Export options. Download your storyboard as JSON to back it up, or as TXT/Markdown to share with your production team.
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5 text-purple-500" />
              AI Prompt Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            The output format is specifically designed for modern generative AI tools. Image prompts are tuned for Midjourney and Stable Diffusion, while Video prompts focus on camera motion for Sora, Runway, and Kling.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
