import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  History,
  MessageSquare,
  Settings,
  Sun,
  Moon,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarItem } from "./SidebarItem";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  hasFiles: boolean;
  onNewIngestion: () => void;
}

export function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  hasFiles,
  onNewIngestion
}: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarOpen ? 280 : 80 }}
      className={cn(
        "relative flex flex-col border-r border-white/10 bg-black/20 backdrop-blur-xl transition-all",
        !isDarkMode && "border-gray-200 bg-white/50"
      )}
    >
      <div className="flex h-16 items-center justify-between px-6">
        {isSidebarOpen && (
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold tracking-tighter text-orange-500"
          >
            INGESTOR PRO
          </motion.h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="hover:bg-white/10"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-4">
        <SidebarItem
          icon={<Plus size={20} />}
          label="New Ingestion"
          active={activeTab === "ingest" && !hasFiles}
          collapsed={!isSidebarOpen}
          onClick={onNewIngestion}
        />
        <SidebarItem
          icon={<History size={20} />}
          label="History"
          active={activeTab === "history"}
          collapsed={!isSidebarOpen}
          onClick={() => setActiveTab("history")}
        />
        <SidebarItem
          icon={<MessageSquare size={20} />}
          label="Chat with Data"
          active={activeTab === "chat"}
          collapsed={!isSidebarOpen}
          onClick={() => setActiveTab("chat")}
        />
        <SidebarItem
          icon={<Share2 size={20} />}
          label="Knowledge Graph"
          active={activeTab === "graph"}
          collapsed={!isSidebarOpen}
          onClick={() => setActiveTab("graph")}
        />
        <SidebarItem
          icon={<Settings size={20} />}
          label="Settings"
          active={activeTab === "settings"}
          collapsed={!isSidebarOpen}
          onClick={() => setActiveTab("settings")}
        />
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="w-full justify-start gap-3 px-3 hover:bg-white/10"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isSidebarOpen && <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
