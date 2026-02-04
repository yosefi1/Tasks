/** Show short URL for table display: hostname only (e.g. facebook.com) */
export function shortUrlDisplay(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : "https://" + url);
    return u.hostname.replace(/^www\./i, "");
  } catch {
    return url.length > 25 ? url.slice(0, 25) + "…" : url;
  }
}
