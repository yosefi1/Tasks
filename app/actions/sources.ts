"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { sourceSchema, type SourceSchema } from "@/lib/validations/source";

export type SourceFilters = {
  category?: "private" | "work";
  type?: "site" | "video";
  search?: string;
};

export async function getSources(filters: SourceFilters = {}) {
  const where: Prisma.SourceWhereInput = {};

  if (filters.category) where.category = filters.category;
  if (filters.type) where.type = filters.type;
  if (filters.search?.trim()) {
    where.OR = [
      { title: { contains: filters.search.trim() } },
      { url: { contains: filters.search.trim() } },
    ];
  }

  const sources = await prisma.source.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return sources;
}

export async function createSource(data: SourceSchema) {
  const parsed = sourceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const { topic, ...rest } = parsed.data;
  const source = await prisma.source.create({
    data: { ...rest, topic: topic || null },
  });
  revalidatePath("/");
  return { data: source };
}

export async function updateSource(id: string, data: SourceSchema) {
  const parsed = sourceSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };
  const { topic, ...rest } = parsed.data;
  const source = await prisma.source.update({
    where: { id },
    data: { ...rest, topic: topic || null },
  });
  revalidatePath("/");
  return { data: source };
}

export async function deleteSource(id: string) {
  await prisma.source.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

/** Parse pasted text: one item per line, optional "title | url" or just URL */
export async function bulkCreateSources(
  category: "private" | "work",
  pastedText: string,
  type: "site" | "video" = "site"
) {
  const lines = pastedText
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  const created: { title: string; url: string }[] = [];
  for (const line of lines) {
    const pipe = line.indexOf("|");
    let title: string;
    let url: string;
    if (pipe > 0) {
      title = line.slice(0, pipe).trim();
      url = line.slice(pipe + 1).trim();
    } else {
      url = line;
      try {
        const u = new URL(line);
        title = u.hostname || line.slice(0, 80);
      } catch {
        title = line.slice(0, 80);
      }
    }
    if (!url) continue;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const res = await createSource({
      title: title || url,
      url,
      type,
      category,
      topic: "",
      sortOrder: created.length,
      notes: "",
    });
    if (res.data) created.push({ title: res.data.title, url: res.data.url });
  }
  return { created: created.length, items: created };
}
