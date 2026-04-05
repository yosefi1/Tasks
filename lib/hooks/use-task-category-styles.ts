"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { updateTaskCategoryStyle } from "@/app/actions/task-category-styles";

export function useTaskCategoryStyles() {
  return useQuery({
    queryKey: ["task-category-styles"],
    queryFn: async () => {
      const res = await fetch("/api/task-category-styles");
      if (!res.ok) throw new Error("Failed to load task category colors");
      return res.json() as Promise<{ id: string; slug: string; color: string }[]>;
    },
  });
}

export function useUpdateTaskCategoryStyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { slug: "personal" | "work"; color: string }) => {
      const res = await updateTaskCategoryStyle(payload.slug, payload.color);
      if ("error" in res && res.error) throw new Error(res.error);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task-category-styles"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
