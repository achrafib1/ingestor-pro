import React from "react";
import { FileText, Eraser, Copy, Download, X, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { IngestedFile } from "@/lib/types";
import { toast } from "sonner";

interface ContentViewerProps {
  selectedFile: IngestedFile;
  onClose: () => void;
  onCleanup: () => void;
  formatBytes: (bytes: number) => string;
}

export function ContentViewer({ selectedFile, onClose, onCleanup, formatBytes }: ContentViewerProps) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(selectedFile.content);
    toast.success("File content copied");
  };

  const downloadFile = () => {
    const blob = new Blob([selectedFile.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = selectedFile.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  return (
    <Card className="lg:col-span-8 bg-white/5 border-white/10 flex flex-col h-[700px]">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <FileText size={18} className="text-orange-500" />
          <div className="overflow-hidden">
            <h3 className="font-medium truncate">{selectedFile.name}</h3>
            <p className="text-xs text-white/40 truncate">{selectedFile.path}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onCleanup}
                className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
              >
                <Eraser size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Intelligent Cleanup</TooltipContent>
          </Tooltip>
          {selectedFile.summary && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedFile.summary!);
                    toast.success("Summary copied");
                  }}
                  className="text-orange-500 hover:text-orange-400 hover:bg-orange-500/10"
                >
                  <Share2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Summary</TooltipContent>
            </Tooltip>
          )}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                <Copy size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Copy Content</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={downloadFile}>
                <Download size={16} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download File</TooltipContent>
          </Tooltip>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[600px] p-6 font-mono text-xs leading-relaxed">
        {selectedFile.summary && (
          <div className="mb-6 p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl font-sans italic text-orange-200/80">
            <span className="font-bold text-orange-500 not-italic mr-2">AI Summary:</span>
            {selectedFile.summary}
          </div>
        )}
        <pre className="whitespace-pre-wrap break-all text-white/80">
          {selectedFile.content}
        </pre>
      </ScrollArea>
      <div className="p-3 border-t border-white/10 bg-black/20 flex items-center justify-between text-[10px] text-white/40">
        <div className="flex gap-4">
          <span>{selectedFile.tokens.toLocaleString()} tokens</span>
          <span>{formatBytes(selectedFile.size)}</span>
        </div>
        <span>{selectedFile.type}</span>
      </div>
    </Card>
  );
}
