import type { TaskWithSteps } from "@/lib/types";

/** Resolve left stripe: per-task accent, else tab category color map */
export function resolveTaskStripeColor(
  task: TaskWithSteps,
  categoryColors: Record<string, string>
): string {
  if (task.accentColor && /^#[0-9A-Fa-f]{6}$/.test(task.accentColor)) {
    return task.accentColor;
  }
  return categoryColors[task.category] ?? "#64748b";
}
