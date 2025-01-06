"use client";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface StatsBoxProps {
  title: string;
  subtitle: string;
  value: string;
  change?: number;
  info?: string;
}

export function StatsBox({ title, subtitle, value, change, info }: StatsBoxProps) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <p className="text-sm text-[#71717A]">{subtitle}</p>
        </div>
        <div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-white">{value}</p>
            {change !== undefined && (
              <div
                className={cn(
                  "flex items-center gap-0.5 text-sm",
                  change > 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                {change > 0 ? (
                  <ArrowUpIcon className="w-3 h-3" />
                ) : (
                  <ArrowDownIcon className="w-3 h-3" />
                )}
                <span>{Math.abs(change).toFixed(1)}%</span>
              </div>
            )}
          </div>
          {info && <p className="mt-1 text-sm text-[#71717A]">{info}</p>}
        </div>
      </div>
    </Card>
  );
} 