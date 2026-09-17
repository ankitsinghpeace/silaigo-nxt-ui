"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DateRange,
  RANGE_PRESETS,
  presetRange,
  formatDay,
} from "@/lib/adminSampleData";

interface Props {
  range: DateRange;
  onChange: (r: DateRange) => void;
}

const DateRangeFilter: React.FC<Props> = ({ range, onChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        {formatDay(range.from)} – {formatDay(range.to)}
      </span>

      <div className="flex items-center gap-1">
        {RANGE_PRESETS.map((p) => {
          const preset = presetRange(p.days);
          const active = preset.from === range.from && preset.to === range.to;
          return (
            <Button
              key={p.label}
              size="sm"
              variant={active ? "default" : "ghost"}
              className={cn("h-8 text-xs", !active && "text-muted-foreground")}
              onClick={() => onChange(preset)}
            >
              {p.label}
            </Button>
          );
        })}
      </div>

      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={range.from}
          max={range.to}
          onChange={(e) => onChange({ ...range, from: e.target.value })}
          className="h-8 w-[140px] text-xs"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          value={range.to}
          min={range.from}
          onChange={(e) => onChange({ ...range, to: e.target.value })}
          className="h-8 w-[140px] text-xs"
        />
      </div>
    </div>
  );
};

export default DateRangeFilter;
