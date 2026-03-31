import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  History as HistoryIcon,
  ExternalLink,
  Trash2,
  Clock,
  FileText
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { IngestionHistory } from "@/lib/types";
import { toast } from "sonner";

interface HistoryProps {
  history: IngestionHistory[];
  setHistory: React.Dispatch<React.SetStateAction<IngestionHistory[]>>;
  onLoadHistory: (item: IngestionHistory) => void;
  formatBytes: (bytes: number) => string;
}

export function History({ history, setHistory, onLoadHistory, formatBytes }: HistoryProps) {
  const onDeleteHistory = (id: string) => {
    const updatedHistory = history.filter(item => item.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem("ingestionHistory", JSON.stringify(updatedHistory));
    toast.success("History item deleted");
  };
  return (
    <motion.div
      key="history"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="text-orange-500" size={20} />
            Ingestion History
          </CardTitle>
          <CardDescription>Access your previous ingestion sessions.</CardDescription>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <HistoryIcon size={48} className="mx-auto mb-4 opacity-20" />
              <p>No history yet. Start by ingesting some files!</p>
            </div>
          ) : (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="group relative bg-white/5 border border-white/10 rounded-xl p-4 hover:border-orange-500/30 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-orange-500">{item.source}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(item.timestamp).toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={12} />
                            {item.files.length} files
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLoadHistory(item)}
                          className="gap-2 hover:bg-orange-500/10 hover:text-orange-500"
                        >
                          <ExternalLink size={14} /> Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteHistory(item.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-hidden">
                      {item.type === "folder" && <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] uppercase font-bold tracking-wider">Folder</span>}
                      {item.type === "url" && <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px] uppercase font-bold tracking-wider">URL</span>}
                      {item.type === "files" && <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] uppercase font-bold tracking-wider">Files</span>}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
