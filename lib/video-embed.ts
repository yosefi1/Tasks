export type VideoEmbedKind = "facebook" | "youtube";

export type VideoEmbedInfo = {
  kind: VideoEmbedKind;
  embedUrl: string;
};

function parseHttpUrl(input: string): URL | null {
  try {
    const t = input.trim();
    if (!t) return null;
    return new URL(
      t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`
    );
  } catch {
    return null;
  }
}

/** Hostname without leading www/m/web. */
function baseHost(hostname: string): string {
  return hostname
    .replace(/^www\./i, "")
    .replace(/^m\./i, "")
    .replace(/^web\./i, "");
}

function isLikelyFacebookVideoUrl(u: URL): boolean {
  const host = baseHost(u.hostname);
  if (host === "fb.watch") return true;
  if (host !== "facebook.com") return false;
  const p = u.pathname.toLowerCase();
  return (
    p.includes("/videos/") ||
    p.includes("/video.php") ||
    p.startsWith("/watch") ||
    p.includes("/reel/") ||
    p.includes("/reels/")
  );
}

function facebookCanonicalHref(u: URL): string {
  if (baseHost(u.hostname) === "fb.watch") {
    return u.href;
  }
  const copy = new URL(u.href);
  copy.hostname = "www.facebook.com";
  copy.protocol = "https:";
  return copy.href;
}

function youtubeEmbedUrl(u: URL): string | null {
  const host = baseHost(u.hostname);
  let videoId: string | null = null;

  if (
    host === "youtube.com" ||
    host === "youtube-nocookie.com" ||
    host === "m.youtube.com"
  ) {
    if (u.pathname === "/watch" || u.pathname.startsWith("/watch")) {
      videoId = u.searchParams.get("v");
    } else if (u.pathname.startsWith("/shorts/")) {
      videoId = u.pathname.split("/").filter(Boolean)[1] ?? null;
    } else if (u.pathname.startsWith("/embed/")) {
      videoId = u.pathname.split("/").filter(Boolean)[1] ?? null;
    }
  } else if (host === "youtu.be") {
    videoId = u.pathname.replace(/^\//, "").split("/")[0] || null;
  }

  if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) return null;
  return `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0`;
}

/**
 * Returns embed info for in-page video preview (Facebook plugin URL or YouTube embed).
 * Returns null when the URL is not a recognized public video link.
 */
export function getVideoEmbedInfo(url: string): VideoEmbedInfo | null {
  const u = parseHttpUrl(url);
  if (!u) return null;

  const yt = youtubeEmbedUrl(u);
  if (yt) {
    return { kind: "youtube", embedUrl: yt };
  }

  if (isLikelyFacebookVideoUrl(u)) {
    const href = facebookCanonicalHref(u);
    const embedUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(href)}&show_text=false&width=500`;
    return { kind: "facebook", embedUrl };
  }

  return null;
}
