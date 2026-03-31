import React from "react";
import { FileText, Loader2, Check } from "lucide-react";
import { StatCard } from "./StatCard";
import { formatBytes } from "@/lib/utils";

interface StatsBarProps {
  totalTokens: number;
  totalSize: number;
  filesCount: number;
  formatBytes: (bytes: number) => string;
}

export function StatsBar({ totalTokens, totalSize, filesCount, formatBytes }: StatsBarProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Tokens" value={totalTokens.toLocaleString()} subValue="Estimated" icon={<FileText size={18} />} />
      <StatCard label="Total Size" value={formatBytes(totalSize)} subValue="Raw Data" icon={<Loader2 size={18} />} />
      <StatCard label="Files Processed" value={filesCount.toString()} subValue="Filtered" icon={<Check size={18} />} />
    </div>
  );
}
