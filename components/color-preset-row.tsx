"use client";

import { Input } from "@/components/ui/input";
import { ACCENT_PRESETS } from "@/lib/color-presets";
import { cn } from "@/lib/utils";

type ColorPresetRowProps = {
  value: string;
  onChange: (hex: string) => void;
  className?: string;
};

export function ColorPresetRow({ value, onChange, className }: ColorPresetRowProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      {ACCENT_PRESETS.map((c) => (
        <button
          key={c}
          type="button"
          title={c}
          className={cn(
            "h-6 w-6 shrink-0 rounded border border-border/80 shadow-sm transition ring-offset-2 hover:scale-105",
            value === c && "ring-2 ring-primary"
          )}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
      ))}
      <Input
        className="h-7 w-[88px] font-mono text-xs"
        placeholder="#hex"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
