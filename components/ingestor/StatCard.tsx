import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
}

export function StatCard({ label, value, subValue, icon }: StatCardProps) {
  return (
    <Card className="bg-white/5 border-white/10">
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500">
          {icon}
        </div>
        <div>
          <p className="text-sm text-white/40">{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-bold">{value}</h3>
            <span className="text-[10px] text-white/20 uppercase tracking-tighter">{subValue}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
