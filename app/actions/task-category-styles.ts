"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { isValidHexColor } from "@/lib/color-presets";

export async function getTaskCategoryStyles() {
  return prisma.taskCategoryStyle.findMany({ orderBy: { slug: "asc" } });
}

export async function updateTaskCategoryStyle(slug: "personal" | "work", color: string) {
  const trimmed = color.trim();
  if (!isValidHexColor(trimmed)) {
    return { error: "Use a hex color like #6366f1" as const };
  }
  await prisma.taskCategoryStyle.update({
    where: { slug },
    data: { color: trimmed },
  });
  revalidatePath("/");
  return { success: true as const };
}
