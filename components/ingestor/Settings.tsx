import React from "react";
import { motion } from "motion/react";
import {
  Settings as SettingsIcon,
  Shield,
  Cpu,
  Database,
  Moon,
  Sun,
  Trash2,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SettingsProps {
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onClearHistory: () => void;
  ignorePatterns: string[];
  setIgnorePatterns: (patterns: string[]) => void;
  defaultIgnorePatterns: string[];
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

export function Settings({
  isDarkMode,
  setIsDarkMode,
  onClearHistory,
  ignorePatterns,
  setIgnorePatterns,
  defaultIgnorePatterns,
  geminiApiKey,
  setGeminiApiKey
}: SettingsProps) {
  const [newPattern, setNewPattern] = React.useState("");

  const handleAddPattern = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPattern = newPattern.trim();
    if (cleanPattern && !ignorePatterns.includes(cleanPattern)) {
      setIgnorePatterns([...ignorePatterns, cleanPattern]);
      setNewPattern("");
      toast.success(`Added pattern: ${cleanPattern}`);
    } else if (ignorePatterns.includes(cleanPattern)) {
      toast.error("Pattern already exists");
    }
  };

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="text-orange-500" size={20} />
            Application Settings
          </CardTitle>
          <CardDescription>Configure your Ingestor Pro experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Moon size={16} className="text-white/60" />
                <h4 className="font-medium">Dark Mode</h4>
              </div>
              <p className="text-sm text-white/40">Toggle between dark and light themes.</p>
            </div>
            <Switch checked={isDarkMode} onCheckedChange={setIsDarkMode} />
          </div>

          <Separator className="bg-white/5" />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="font-medium">Ignore Patterns</h4>
                <p className="text-sm text-white/40">Files matching these patterns will be skipped during ingestion.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIgnorePatterns(defaultIgnorePatterns)}
              >
                Reset to Default
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {ignorePatterns.map((pattern, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1 px-2 py-1">
                  {pattern}
                  <button
                    onClick={() => setIgnorePatterns(ignorePatterns.filter((_, i) => i !== idx))}
                    className="hover:text-red-500"
                  >
                    <Trash2 size={10} />
                  </button>
                </Badge>
              ))}
            </div>
            <form onSubmit={handleAddPattern} className="flex gap-2 pt-2">
              <Input
                placeholder="Add custom pattern (e.g. *.log, .env.local)..."
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                className="bg-black/20 border-white/10 max-w-sm"
              />
              <Button type="submit" variant="secondary" disabled={!newPattern.trim()}>
                Add Pattern
              </Button>
            </form>
          </div>

          <Separator className="bg-white/5" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-white/60" />
                <h4 className="font-medium">Privacy Mode</h4>
              </div>
              <p className="text-sm text-white/40">Data is processed locally and only sent to Gemini for chat.</p>
            </div>
            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
          </div>

          <Separator className="bg-white/5" />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Cpu size={16} className="text-white/60" />
                <h4 className="font-medium">AI Model</h4>
              </div>
              <p className="text-sm text-white/40">Use Gemini API for generation.</p>
            </div>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Gemini 3 Flash</Badge>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-medium">Gemini API Key</h4>
              <p className="text-xs text-white/40">Provide a valid Google Gemini API key to enable AI-powered chat and file summarizations.</p>
            </div>
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              className="bg-black/20 border-white/10 text-white placeholder:text-white/20"
            />
          </div>

          <Separator className="bg-white/5" />

          <div className="pt-4">
            <h4 className="font-medium text-red-500 mb-4 flex items-center gap-2">
              <Database size={16} />
              Danger Zone
            </h4>
            <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Clear All History</p>
                <p className="text-xs text-white/40">This will permanently delete all your ingestion records.</p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={onClearHistory}
                className="gap-2"
              >
                <Trash2 size={14} /> Clear History
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw size={16} className="text-white/40" />
            System Info
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-white/40 space-y-1">
          <p>Version: 1.2.0-pro</p>
          <p>Environment: Production</p>
          <p>Storage: Local Browser Storage</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
