"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownRight, ArrowUpRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatTileProps {
  label: string;
  value: string | number;
  delta?: number;
  sub?: string;
  icon: LucideIcon;
  tone?: "primary" | "emerald" | "amber" | "rose" | "violet" | "sky";
  invertDelta?: boolean;
  onClick?: () => void;
}

const TONES: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  rose: "bg-rose-100 text-rose-600",
  violet: "bg-violet-100 text-violet-600",
  sky: "bg-sky-100 text-sky-600",
};

const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  delta,
  sub,
  icon: Icon,
  tone = "primary",
  invertDelta,
  onClick,
}) => {
  const positive = (delta ?? 0) >= 0;
  const good = invertDelta ? !positive : positive;

  return (
    <Card
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "border-border/60 shadow-sm",
        onClick &&
          "cursor-pointer transition-all hover:border-primary/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <CardContent className="p-4 flex items-start gap-3">
        <div className={cn("rounded-xl p-2.5 shrink-0", TONES[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-2xl font-bold leading-tight mt-0.5">{value}</p>
          {typeof delta === "number" && (
            <p
              className={cn(
                "text-xs font-medium mt-1 inline-flex items-center gap-1",
                good ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {positive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(delta)}%
            </p>
          )}
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatTile;
