import { z } from "zod";

const typeEnum = z.enum(["site", "video"]);

const urlTransform = z
  .string()
  .min(1, "URL is required")
  .transform((s) => {
    const t = s.trim();
    if (!/^https?:\/\//i.test(t)) return "https://" + t;
    return t;
  })
  .pipe(z.string().url("Enter a valid URL (https:// is added automatically)"));

export const sourceSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  url: urlTransform,
  type: typeEnum,
  categoryId: z.string().min(1, "Category is required"),
  topic: z.string().max(100).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

export type SourceSchema = z.infer<typeof sourceSchema>;
