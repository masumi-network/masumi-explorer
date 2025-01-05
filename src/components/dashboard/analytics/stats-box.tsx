"use client";

import { cn } from "@/lib/utils";

interface StatsBoxProps {
  title: string;
  subtitle: string;
  value: string;
  change: number;
  info?: string;
}

export function StatsBox({ title, subtitle, value, change, info }: StatsBoxProps) {
  return (
    <div className="rounded-xl bg-[#0A0A0A] border border-[#1F1F1F] p-4">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm text-[#71717A]">{title}</div>
        <button className="text-[#71717A] hover:text-white">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 1.75C4.325 1.75 1.75 4.325 1.75 7.5C1.75 10.675 4.325 13.25 7.5 13.25C10.675 13.25 13.25 10.675 13.25 7.5C13.25 4.325 10.675 1.75 7.5 1.75ZM8.25 10.25H6.75V6.75H8.25V10.25ZM8.25 5.25H6.75V3.75H8.25V5.25Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <div className="text-sm text-[#52525B] mb-3">{subtitle}</div>
      <div className="flex items-baseline gap-3">
        <div className="text-2xl font-medium text-white">{value}</div>
        <div className={cn(
          "text-sm px-1.5 py-0.5 rounded",
          change > 0 
            ? "text-emerald-500 bg-emerald-500/10" 
            : "text-red-500 bg-red-500/10"
        )}>
          {change > 0 ? '+' : ''}{change}%
        </div>
      </div>
      {info && <div className="text-sm text-[#3F3F46] mt-1">{info}</div>}
    </div>
  );
} 