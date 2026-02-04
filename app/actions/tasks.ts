"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { taskSchema, type TaskSchema } from "@/lib/validations/task";

export type TaskFilters = {
  category?: string;
  status?: string;
  priority?: string;
  search?: string;
  orderBy?: "date" | "custom";
};

export async function getTasks(filters: TaskFilters = {}) {
  const where: Prisma.TaskWhereInput = {};

  if (filters.category) where.category = filters.category;
  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.search?.trim()) {
    where.title = { contains: filters.search.trim() };
  }

  const orderBy: Prisma.TaskOrderByWithRelationInput[] =
    filters.orderBy === "date"
      ? [{ dueDate: "asc" }, { updatedAt: "desc" }, { createdAt: "desc" }]
      : [{ sortOrder: "asc" }, { updatedAt: "desc" }, { createdAt: "desc" }];

  const tasks = await prisma.task.findMany({
    where,
    orderBy,
    include: {
      steps: { orderBy: { sortOrder: "asc" } },
      links: { orderBy: { sortOrder: "asc" } },
    },
  });
  return tasks;
}

export async function getTaskById(id: string) {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { sortOrder: "asc" } },
      links: { orderBy: { sortOrder: "asc" } },
    },
  });
  return task;
}

export async function updateTaskOrder(orderedIds: string[]) {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.task.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );
  revalidatePath("/");
  return { success: true };
}

export async function createTask(data: TaskSchema) {
  const parsed = taskSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { title, description, category, status, progress, dueDate, priority } =
    parsed.data;
  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      category,
      status,
      progress: progress ?? 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority && priority !== "none" ? priority : null,
    },
  });
  revalidatePath("/");
  return { data: task };
}

export async function updateTask(id: string, data: TaskSchema) {
  const parsed = taskSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }
  const { title, description, category, status, progress, dueDate, priority } =
    parsed.data;
  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description: description || null,
      category,
      status,
      progress: progress ?? 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority && priority !== "none" ? priority : null,
    },
  });
  revalidatePath("/");
  return { data: task };
}

export async function deleteTask(id: string) {
  await prisma.task.delete({ where: { id } });
  revalidatePath("/");
  return { success: true };
}

// Steps
export async function createTaskStep(
  taskId: string,
  title: string,
  progress: number = 0
) {
  const count = await prisma.taskStep.count({ where: { taskId } });
  const step = await prisma.taskStep.create({
    data: {
      taskId,
      title,
      sortOrder: count,
      progress: Math.min(100, Math.max(0, progress)),
    },
  });
  await updateTaskProgressFromSteps(taskId);
  revalidatePath("/");
  return { data: step };
}

export async function updateTaskStep(
  stepId: string,
  data: { title?: string; completed?: boolean; progress?: number }
) {
  const step = await prisma.taskStep.update({
    where: { id: stepId },
    data: data.progress !== undefined ? { ...data, progress: Math.min(100, Math.max(0, data.progress)) } : data,
  });
  await updateTaskProgressFromSteps(step.taskId);
  revalidatePath("/");
  return { data: step };
}

export async function deleteTaskStep(stepId: string) {
  const step = await prisma.taskStep.findUnique({ where: { id: stepId } });
  if (!step) return { error: "Step not found" };
  await prisma.taskStep.delete({ where: { id: stepId } });
  await updateTaskProgressFromSteps(step.taskId);
  revalidatePath("/");
  return { success: true };
}

async function updateTaskProgressFromSteps(taskId: string) {
  const steps = await prisma.taskStep.findMany({
    where: { taskId },
    orderBy: { sortOrder: "asc" },
  });
  const total = steps.length;
  const progress =
    total > 0
      ? Math.round(steps.reduce((sum, s) => sum + (s.progress ?? 0), 0) / total)
      : 0;
  await prisma.task.update({
    where: { id: taskId },
    data: { progress },
  });
}

// Task links
function normalizeUrl(url: string): string {
  const t = url.trim();
  if (!/^https?:\/\//i.test(t)) return "https://" + t;
  return t;
}

export async function createTaskLink(
  taskId: string,
  data: { url: string; displayName: string; note?: string }
) {
  const url = normalizeUrl(data.url);
  const count = await prisma.taskLink.count({ where: { taskId } });
  const link = await prisma.taskLink.create({
    data: {
      taskId,
      url,
      displayName: data.displayName.trim() || url,
      note: data.note?.trim() || null,
      sortOrder: count,
    },
  });
  revalidatePath("/");
  return { data: link };
}

export async function updateTaskLink(
  linkId: string,
  data: { url?: string; displayName?: string; note?: string }
) {
  const existing = await prisma.taskLink.findUnique({ where: { id: linkId } });
  if (!existing) return { error: "Link not found" };
  const update: { url?: string; displayName?: string; note?: string | null } = {};
  if (data.url !== undefined) update.url = normalizeUrl(data.url);
  if (data.displayName !== undefined) update.displayName = data.displayName.trim() || existing.url;
  if (data.note !== undefined) update.note = data.note?.trim() || null;
  const link = await prisma.taskLink.update({
    where: { id: linkId },
    data: update,
  });
  revalidatePath("/");
  return { data: link };
}

export async function deleteTaskLink(linkId: string) {
  await prisma.taskLink.delete({ where: { id: linkId } });
  revalidatePath("/");
  return { success: true };
}
