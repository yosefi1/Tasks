"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";

export async function getSourceCategories() {
  return prisma.sourceCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function createSourceCategory(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required" as const };
  const max = await prisma.sourceCategory.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (max._max.sortOrder ?? -1) + 1;
  try {
    const data = await prisma.sourceCategory.create({
      data: { name: trimmed, sortOrder },
    });
    revalidatePath("/");
    return { data };
  } catch {
    return { error: "A category with this name already exists" as const };
  }
}

export async function updateSourceCategory(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { error: "Name is required" as const };
  try {
    const data = await prisma.sourceCategory.update({
      where: { id },
      data: { name: trimmed },
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
