"use client";

import {
  getVideoEmbedInfo,
  type VideoEmbedInfo,
} from "@/lib/video-embed";
import { cn } from "@/lib/utils";

type VideoEmbedPreviewProps = {
  url: string;
  /** When set (e.g. from parent), skips a second parse of `url`. */
  embedInfo?: VideoEmbedInfo | null;
  className?: string;
};

export function VideoEmbedPreview({
  url,
  embedInfo,
  className,
}: VideoEmbedPreviewProps) {
  const info = embedInfo !== undefined ? embedInfo : getVideoEmbedInfo(url);
  if (!info) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-muted-foreground text-xs font-medium">Preview</p>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border bg-muted",
          info.kind === "youtube" ? "aspect-video" : "min-h-[300px] sm:min-h-[380px]"
        )}
      >
        <iframe
          src={info.embedUrl}
          className={cn(
            "w-full border-0",
            info.kind === "youtube" ? "h-full absolute inset-0" : "min-h-[300px] sm:min-h-[380px]"
          )}
          title="Video preview"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </div>
  );
}
