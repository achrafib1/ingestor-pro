import React from "react";
import { Search, Trash2, FileText, Copy } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FileTree } from "./FileTree";
import { cn } from "@/lib/utils";
import { IngestedFile } from "@/lib/types";

interface FileExplorerProps {
  files: IngestedFile[];
  filteredFiles: IngestedFile[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  viewMode: "list" | "tree";
  setViewMode: (mode: "list" | "tree") => void;
  selectedFile: IngestedFile | null;
  setSelectedFile: (file: IngestedFile | null) => void;
  currentSource: string | null;
  onClearWorkspace: () => void;
}

export function FileExplorer({
  files,
  filteredFiles,
  searchQuery,
  setSearchQuery,
  viewMode,
  setViewMode,
  selectedFile,
  setSelectedFile,
  currentSource,
  onClearWorkspace
}: FileExplorerProps) {
  const handleCopyTree = async () => {
    if (!files || files.length === 0) {
      toast.error("No files to copy");
      return;
    }

    const paths = files.map((f: IngestedFile) => f.path);
    const root: any = {};
    paths.forEach((path: string) => {
      const parts = path.split('/');
      let current = root;
      parts.forEach((part: string, i: number) => {
        if (!current[part]) current[part] = i === parts.length - 1 ? null : {};
        current = current[part];
      });
    });

    const formatTree = (node: any, prefix = '') => {
      let result = '';
      const keys = Object.keys(node);
      keys.forEach((key, i) => {
        const isLast = i === keys.length - 1;
        result += prefix + (isLast ? '└── ' : '├── ') + key + '\n';
        if (node[key]) {
          result += formatTree(node[key], prefix + (isLast ? '    ' : '│   '));
        }
      });
      return result;
    };

    const treeText = formatTree(root);
    await navigator.clipboard.writeText(treeText);
    toast.success("Folder structure copied to clipboard");
  };

  return (
    <Card className={cn(
      "bg-white/5 border-white/10 overflow-hidden",
      selectedFile ? "lg:col-span-4" : "lg:col-span-12"
    )}>
      <div className="p-4 border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <Input
            placeholder="Search files..."
            className="pl-10 bg-black/20 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
            <TabsList className="bg-black/20 border-white/10">
              <TabsTrigger value="list" className="px-3">List</TabsTrigger>
              <TabsTrigger value="tree" className="px-3">Tree</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            {currentSource && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 hidden md:flex">
                Source: {currentSource}
              </Badge>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleCopyTree} className="text-white hover:text-white hover:bg-white/10">
                  <Copy size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy Tree Structure</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClearWorkspace}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear Workspace</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
      <ScrollArea className="h-[600px]">
        {viewMode === "list" ? (
          <div className="divide-y divide-white/5">
            {filteredFiles.map((file, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-4 hover:bg-white/5 transition-colors group cursor-pointer",
                  selectedFile?.path === file.path && "bg-orange-500/10 border-l-2 border-orange-500"
                )}
                onClick={() => setSelectedFile(file)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileText size={18} className="text-orange-500/70 shrink-0" />
                    <div className="overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{file.name}</p>
                        {file.summary && (
                          <Badge variant="outline" className="text-[8px] h-4 px-1 bg-orange-500/10 text-orange-500 border-orange-500/20">
                            Summary
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 font-mono truncate">{file.path}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[10px] font-medium">{file.tokens.toLocaleString()} t</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            <FileTree
              files={filteredFiles}
              onSelect={setSelectedFile}
              selectedPath={selectedFile?.path}
            />
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
