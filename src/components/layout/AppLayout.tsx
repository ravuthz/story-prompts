import { Outlet, Link, useLocation } from "react-router-dom";
import { 
  Clapperboard, FileText, Sparkles, Database, Sun, Power, 
  Home, Folder, LayoutTemplate, Film, Users, Settings, Clock, 
  Download, Trash2, HelpCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useProjectStore } from "@/stores/useProjectStore";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/builder", label: "Projects", icon: Folder },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/scenes", label: "Scenes", icon: Film }, 
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/history", label: "Prompt History", icon: Clock },
];

export default function AppLayout() {
  const location = useLocation();
  const { getCurrentProject } = useProjectStore();
  const currentProject = getCurrentProject();
  
  const [mode, setMode] = useState<"static" | "ai">("static");

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
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors mb-1",
              isActive 
                ? "bg-slate-100 text-slate-900" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
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
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Top Header */}
      <header className="h-[72px] bg-white border-b flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
        <Link to="/" className="flex items-center gap-3 w-72">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center shrink-0">
            <Clapperboard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-[17px] leading-tight text-slate-900">Storyboard Prompt Builder</h1>
            <p className="text-[11px] text-slate-500 font-medium">Create AI Video Storyboard Prompts in Seconds</p>
          </div>
        </Link>

        {/* Mode Toggles */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button 
            onClick={() => setMode("static")}
            className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all text-left", mode === "static" ? "bg-[#5436D6] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50")}
          >
            <FileText className="w-4 h-4 shrink-0" />
            <div className="leading-tight">
              <div>1. Static Template Builder</div>
              <div className={cn("text-[10px] font-normal", mode === "static" ? "text-purple-200" : "text-slate-400")}>Build & copy prompts</div>
            </div>
          </button>
          <button 
            onClick={() => setMode("ai")}
            className={cn("flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all text-left", mode === "ai" ? "bg-[#5436D6] text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50")}
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <div className="leading-tight">
              <div>2. AI Generate in App</div>
              <div className={cn("text-[10px] font-normal", mode === "ai" ? "text-purple-200" : "text-slate-400")}>Use Gemini API in-app</div>
            </div>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-green-50/50 border border-green-100 rounded-lg text-green-700">
            <Database className="w-4 h-4 text-green-600" />
            <div className="text-sm font-semibold leading-tight text-left">
              <div>Data Stored Locally</div>
              <div className="text-[10px] font-normal text-green-600/70">Everything saved in your browser</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full h-10 w-10 border border-slate-200 bg-white shadow-sm shrink-0">
            <Sun className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900 rounded-full h-10 w-10 border border-slate-200 bg-white shadow-sm shrink-0">
            <Power className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="hidden md:flex w-64 bg-white border-r flex-col shrink-0 overflow-y-auto">
          <nav className="flex-1 p-4">
            <NavLinks />
            
            {currentProject && (
              <div className="mt-8 mb-4">
                <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-3 px-3">Current Project</div>
                <Link to={`/results/${currentProject.id}`} className="flex items-center gap-3 p-3 rounded-xl border bg-slate-50/50 hover:bg-slate-100 transition-colors">
                  <div className="w-10 h-10 bg-slate-800 rounded-md overflow-hidden shrink-0 flex items-center justify-center text-white/20">
                     <Film className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold truncate text-slate-900">{currentProject.title}</div>
                    <div className="text-[11px] text-slate-500 truncate">{currentProject.scenes.length} Scenes • {currentProject.settings.movieType}</div>
                  </div>
                </Link>
              </div>
            )}

            <div className="mt-8 space-y-4">
              <div className="p-4 rounded-xl border border-purple-100 bg-purple-50/30 flex gap-3">
                <Database className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-purple-900 mb-1">All Data Stored Locally</div>
                  <div className="text-[11px] text-purple-700/70 leading-snug">Your projects, prompts and settings never leave your device.</div>
                </div>
              </div>

              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 px-4 border-slate-200 text-[#5436D6] hover:text-[#5436D6] hover:bg-purple-50 rounded-xl">
                <Download className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Export All Data</div>
                  <div className="text-[10px] text-slate-500 font-normal">Backup your data (JSON)</div>
                </div>
              </Button>

              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3 px-4 border-red-100 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl">
                <Trash2 className="w-4 h-4 shrink-0" />
                <div className="text-left">
                  <div className="text-sm font-semibold">Clear All Data</div>
                  <div className="text-[10px] text-red-400 font-normal">Delete everything locally</div>
                </div>
              </Button>
            </div>
          </nav>

          <div className="p-4 mt-auto border-t">
            <Link to="/about" className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors">
              <HelpCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <div className="text-sm font-semibold text-slate-900">About</div>
                <div className="text-[11px] text-slate-500">How it works</div>
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}