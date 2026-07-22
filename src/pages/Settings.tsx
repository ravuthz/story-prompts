import { useState } from "react";
import { Key, Save, Trash2, Shield, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { useProjectStore } from "@/stores/useProjectStore";
import { useCharacterStore } from "@/stores/useCharacterStore";

export default function Settings() {
  const settings = useSettingsStore();
  const projects = useProjectStore(state => state.projects);
  const characters = useCharacterStore(state => state.characters);
  
  const [apiKeyInput, setApiKeyInput] = useState(settings.geminiApiKey);
  const [rememberKey, setRememberKey] = useState(settings.rememberApiKey);

  const handleSaveApiSettings = () => {
    settings.setGeminiApiKey(apiKeyInput);
    settings.setRememberApiKey(rememberKey);
    toast.success("API settings saved locally");
  };

  const handleClearAllData = () => {
    if (window.confirm("WARNING: This will permanently delete all your projects, characters, and settings. Are you sure?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleExportAllData = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: 1,
      projects,
      characters,
      preferences: {
        theme: settings.theme,
        rememberApiKey: settings.rememberApiKey,
      },
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `storyboard-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Data backup exported");
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application preferences and API keys.
        </p>
      </div>

      <div className="grid gap-5">
        
        {/* Gemini API Key */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Gemini API Keys
            </CardTitle>
            <CardDescription>
              Add one or more keys for in-app generation. Put each key on a new line.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-muted/50 p-4 rounded-lg flex gap-3 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-foreground mb-1">Privacy Notice</p>
                <p>Your keys are sent only to Google's official Gemini API. When multiple keys are provided, the app tries them in order until one succeeds.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API keys</Label>
              <Textarea
                id="apiKey"
                rows={5}
                spellCheck={false}
                placeholder={"AIzaSy...\nAIzaSy..."}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">One key per line. Blank lines are ignored.</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="rememberKey" 
                checked={rememberKey}
                onCheckedChange={setRememberKey}
              />
              <Label htmlFor="rememberKey" className="font-normal">
                Remember my API keys in local storage
              </Label>
            </div>

          </CardContent>
          <CardFooter className="border-t bg-muted/20 pt-4">
            <Button onClick={handleSaveApiSettings} className="gap-2">
              <Save className="w-4 h-4" /> Save API Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
            <CardDescription>Download a JSON backup or clear the application data stored in this browser.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row">
            <Button variant="outline" onClick={handleExportAllData} className="gap-2">
              <Download className="w-4 h-4" /> Export All Data
            </Button>
            <Button variant="destructive" onClick={handleClearAllData} className="gap-2">
              <Trash2 className="w-4 h-4" /> Clear All Data
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
