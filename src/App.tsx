import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Builder from "@/pages/Builder";
import Results from "@/pages/Results";
import Characters from "@/pages/Characters";
import Templates from "@/pages/Templates";
import History from "@/pages/History";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import { Toaster } from "@/components/ui/sonner";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useEffect } from "react";

function App() {
  const theme = useSettingsStore(state => state.theme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="builder" element={<Builder />} />
          <Route path="results/:projectId" element={<Results />} />
          <Route path="characters" element={<Characters />} />
          <Route path="templates" element={<Templates />} />
          <Route path="history" element={<History />} />
          <Route path="settings" element={<Settings />} />
          <Route path="about" element={<About />} />
        </Route>
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;