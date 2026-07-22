import { Outlet, Link, useLocation } from "react-router-dom";
import { Film, Home, Users, BookTemplate, Clock, Settings, Info, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/builder", label: "Builder", icon: Film },
  { href: "/characters", label: "Characters", icon: Users },
  { href: "/templates", label: "Templates", icon: BookTemplate },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive 
                ? "bg-primary text-primary-foreground" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-card h-screen sticky top-0">
        <div className="p-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <Film className="w-6 h-6" />
            Storyboard
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Prompt Builder</p>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t text-xs text-center text-muted-foreground">
          <p>Local Storage Only</p>
          <p>No backend • No login</p>
        </div>
      </aside>

      {/* Mobile Header & Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden sticky top-0 z-10 flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur">
          <Link to="/" className="flex items-center gap-2 font-bold text-primary">
            <Film className="w-5 h-5" />
            Storyboard
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-6 border-b">
                <div className="flex items-center gap-2 font-bold text-xl text-primary">
                  <Film className="w-6 h-6" />
                  Storyboard
                </div>
              </div>
              <nav className="p-4 space-y-1">
                <NavLinks />
              </nav>
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 flex flex-col relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}