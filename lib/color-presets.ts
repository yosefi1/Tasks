/** Curated palette for task/source accents (hex) */
export const ACCENT_PRESETS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#0ea5e9",
  "#64748b",
] as const;

export function isValidHexColor(s: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(s.trim());
}
