"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

function normalizeHex(c?: string | null): string | null {
  const t = c?.trim();
  if (!t) return null;
  return /^#[0-9A-Fa-f]{6}$/.test(t) ? t : null;
}

export async function getSourceCategories() {
  return prisma.sourceCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createSourceCategory(name: string, color?: string | null) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required" as const };
  const max = await prisma.sourceCategory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;
  try {
    const data = await prisma.sourceCategory.create({
      data: { name: trimmed, sortOrder, color: normalizeHex(color) },
    });
    revalidatePath("/");
    return { data };
  } catch {
    return { error: "A category with this name already exists" as const };
  }
}

export async function updateSourceCategory(
  id: string,
  name: string,
  color?: string | null
) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required" as const };
  try {
    const data = await prisma.sourceCategory.update({
      where: { id },
      data: { name: trimmed, color: normalizeHex(color) },
    });
    revalidatePath("/");
    return { data };
  } catch {
    return { error: "Could not update (duplicate name?)" as const };
  }
}

export async function deleteSourceCategory(id: string) {
  const count = await prisma.source.count({ where: { categoryId: id } });
  if (count > 0) {
    return {
      error: `Cannot delete: ${count} source(s) use this category. Reassign them first.` as const,
    };
  }
  await prisma.sourceCategory.delete({ where: { id } });
  revalidatePath("/");
  return { success: true as const };
}
