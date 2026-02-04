import type { Task, TaskStep, TaskLink } from "@prisma/client";

export type TaskCategory = "personal" | "work";
export type TaskStatus = "backlog" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type TaskWithSteps = Task & { steps: TaskStep[]; links: TaskLink[] };

export type TaskWithOptionalId = Omit<Task, "id" | "createdAt" | "updatedAt"> & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type TaskFormValues = {
  title: string;
  description?: string;
  category: TaskCategory;
  status: TaskStatus;
  progress: number;
  dueDate?: string;
  priority?: TaskPriority;
};

export { type Task, type TaskStep, type TaskLink };
