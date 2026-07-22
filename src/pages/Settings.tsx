import { useState } from "react";
import { Key, Save, Trash2, Shield, Moon, Sun, Monitor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { useSettingsStore } from "@/stores/useSettingsStore";

export default function Settings() {
  const settings = useSettingsStore();
  
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

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your application preferences and API keys.
        </p>
      </div>

      <div className="grid gap-8">
        
        {/* Gemini API Key */}
        <Card className="border-primary/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-primary" />
              Gemini API Key
            </CardTitle>
            <CardDescription>
              Required for AI generation. Get your free key from Google AI Studio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="bg-muted/50 p-4 rounded-lg flex gap-3 text-sm text-muted-foreground">
              <Shield className="w-5 h-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-foreground mb-1">Privacy Notice</p>
                <p>Your API key is never sent to any backend server except directly to Google's official Gemini API. It is stored exclusively in your browser's LocalStorage if you enable the option below.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input 
                id="apiKey"
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="rememberKey" 
                checked={rememberKey}
                onCheckedChange={setRememberKey}
              />
              <Label htmlFor="rememberKey" className="font-normal">
                Remember my API key in local storage
              </Label>
            </div>

          </CardContent>
          <CardFooter className="border-t bg-muted/20 pt-4">
            <Button onClick={handleSaveApiSettings} className="gap-2">
              <Save className="w-4 h-4" /> Save API Settings
            </Button>
          </CardFooter>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the application theme.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-xs">
              <Label>Theme</Label>
              <Select 
                value={settings.theme} 
                onValueChange={(val) => {
                  if (val === "light" || val === "dark" || val === "system") {
                    settings.setTheme(val);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2"><Sun className="w-4 h-4" /> Light</div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2"><Moon className="w-4 h-4" /> Dark</div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2"><Monitor className="w-4 h-4" /> System</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Permanently remove data from your browser.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone. It will clear all your projects, templates, characters, and settings from this browser.
            </p>
            <Button variant="destructive" onClick={handleClearAllData} className="gap-2">
              <Trash2 className="w-4 h-4" /> Clear All Local Data
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}