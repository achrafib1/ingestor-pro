import React, { useState } from "react";
import { FolderOpen, FileText, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { IngestedFile } from "@/lib/types";

interface FileTreeProps {
  files: IngestedFile[];
  onSelect: (file: IngestedFile) => void;
  selectedPath?: string;
}

export function FileTree({ files, onSelect, selectedPath }: FileTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(["root"]));

  const toggleFolder = (path: string) => {
    const newSet = new Set(expandedFolders);
    if (newSet.has(path)) newSet.delete(path);
    else newSet.add(path);
    setExpandedFolders(newSet);
  };

  const buildTree = (files: IngestedFile[]) => {
    const root: any = { name: "root", children: {}, type: "folder", path: "root" };
    files.forEach(file => {
      const parts = file.path.split("/");
      let current = root;
      parts.forEach((part, idx) => {
        if (idx === parts.length - 1) {
          current.children[part] = { ...file, type: "file" };
        } else {
          if (!current.children[part]) {
            current.children[part] = { name: part, children: {}, type: "folder", path: parts.slice(0, idx + 1).join("/") };
          }
          current = current.children[part];
        }
      });
    });
    return root;
  };

  const renderNode = (node: any, depth = 0) => {
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedPath === node.path;

    if (node.type === "file") {
      return (
        <div
          key={node.path}
          className={cn(
            "flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-sm transition-colors",
            isSelected ? "bg-orange-500/20 text-orange-500" : "hover:bg-white/5 text-white/70"
          )}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => onSelect(node)}
        >
          <FileText size={14} className="shrink-0" />
          <span className="truncate">{node.name}</span>
        </div>
      );
    }

    return (
      <div key={node.path}>
        <div
          className="flex items-center gap-2 py-1 px-2 rounded cursor-pointer text-sm hover:bg-white/5 text-white/90 group"
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
          onClick={() => toggleFolder(node.path)}
        >
          {isExpanded ? <ChevronDown size={14} className="shrink-0" /> : <ChevronRight size={14} className="shrink-0" />}
          <FolderOpen size={14} className="shrink-0 text-orange-500/70" />
          <span className="truncate font-medium">{node.name}</span>
        </div>
        {isExpanded && (
          <div className="border-l border-white/5 ml-3">
            {Object.values(node.children).map((child: any) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const tree = buildTree(files);
  return (
    <div className="space-y-1">
      {Object.values(tree.children).map((child: any) => renderNode(child))}
    </div>
  );
}
