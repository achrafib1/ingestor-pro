import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  onClick: () => void;
}

export function SidebarItem({ icon, label, active, collapsed, onClick }: SidebarItemProps) {
  const content = (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-white/10",
        active ? "bg-orange-500/10 text-orange-500" : "text-white/60",
        collapsed && "justify-center px-0"
      )}
    >
      <div className={cn("flex shrink-0 items-center justify-center", collapsed ? "w-10" : "")}>
        {icon}
      </div>
      {!collapsed && <span>{label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="right">{label}</TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
