import { z } from "zod";

const categoryEnum = z.enum(["personal", "work"]);
const statusEnum = z.enum(["backlog", "in_progress", "done"]);
const priorityEnum = z.enum(["low", "medium", "high"]);

export const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  category: categoryEnum,
  status: statusEnum,
  progress: z.coerce.number().min(0).max(100),
  dueDate: z.string().optional().or(z.literal("")),
  priority: priorityEnum.optional().nullable().or(z.literal("")).or(z.literal("none")),
});

export type TaskSchema = z.infer<typeof taskSchema>;
