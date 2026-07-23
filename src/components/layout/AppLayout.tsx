import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Clapperboard, Sun, Moon, Key, Share2,
  Home, Folder, LayoutTemplate, Film, Settings, Clock, HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProjectStore } from "@/stores/useProjectStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { parseGeminiApiKeys } from "@/services/geminiService";
import { toast } from "sonner";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/builder", label: "Projects", icon: Folder },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/history", label: "Prompt History", icon: Clock },
];

export default function AppLayout() {
  const location = useLocation();
  const { getCurrentProject } = useProjectStore();
  const currentProject = getCurrentProject();
  const theme = useSettingsStore(state => state.theme);
  const setTheme = useSettingsStore(state => state.setTheme);
  const geminiApiKey = useSettingsStore(state => state.geminiApiKey);
  const apiKeyCount = parseGeminiApiKeys(geminiApiKey).length;
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleShare = async () => {
    const shareData: ShareData = {
      title: "Storyboard Prompt Builder",
      text: "Create AI video storyboard prompts in seconds.",
      url: window.location.origin,
    };

    try {
      const response = await fetch("/social-preview.png");
      const image = new File([await response.blob()], "storyboard-prompt-builder.png", { type: "image/png" });
      if (navigator.share) {
        if (navigator.canShare?.({ files: [image] })) shareData.files = [image];
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Share link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(window.location.origin);
      toast.success("Share link copied");
    }
  };
  
  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href || 
          (item.href !== "/" && location.pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive 
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
            )}
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        )
      })}
    </>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Top Header */}
      <header className="z-30 flex h-14 shrink-0 items-center justify-between border-b bg-card px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Clapperboard className="size-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight">Storyboard Prompt Builder</h1>
            <p className="text-[10px] text-muted-foreground">AI video prompts in seconds</p>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Badge
            variant={apiKeyCount > 0 ? "outline" : "destructive"}
            className={cn(
              "h-8 rounded-lg px-2.5",
              apiKeyCount > 0 && "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
            )}
            aria-label={apiKeyCount > 0 ? `${apiKeyCount} API key${apiKeyCount === 1 ? "" : "s"} configured` : "No API key configured"}
            title={apiKeyCount > 0 ? `${apiKeyCount} API key${apiKeyCount === 1 ? "" : "s"} configured` : "No API key configured"}
          >
            <Key className={apiKeyCount > 0 ? "text-green-600 dark:text-green-400" : "text-destructive"} />
            <span className="hidden sm:inline">
              {apiKeyCount > 0 ? `${apiKeyCount} API key${apiKeyCount === 1 ? "" : "s"}` : "No API Key"}
            </span>
          </Badge>
          <Button variant="outline" size="icon" className="size-8" onClick={handleShare} aria-label="Share Storyboard Prompt Builder" title="Share">
            <Share2 className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Light theme" : "Dark theme"}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            render={<Link to="/settings" aria-label="Settings" title="Settings" />}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden h-full w-56 shrink-0 flex-col overflow-hidden border-r bg-card md:flex">
          <nav className="flex-1 p-3">
            <NavLinks />
            
            {currentProject && (
              <div className="mt-8 mb-4">
                <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Current Project</div>
                <Link to={currentProject.scenes.length ? `/results/${currentProject.id}` : "/builder"} className="flex items-center gap-2.5 rounded-lg border bg-muted/30 p-2.5 transition-colors hover:bg-muted">
                  <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground/60">
                     <Film className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="truncate text-sm font-semibold">{currentProject.title}</div>
                    <div className="truncate text-[10px] text-muted-foreground">{currentProject.scenes.length} Scenes • {currentProject.settings.movieType}</div>
                  </div>
                </Link>
              </div>
            )}

          </nav>

          <div className="mt-auto border-t p-3">
            <Link to="/about" className="flex items-start gap-2.5 rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <HelpCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                <div className="text-sm font-medium">About</div>
                <div className="text-[10px] text-muted-foreground">How it works</div>
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-muted/20">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
