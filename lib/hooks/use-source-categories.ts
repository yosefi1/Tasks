"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSourceCategory,
  updateSourceCategory,
  deleteSourceCategory,
} from "@/app/actions/source-categories";

export function useSourceCategories() {
  return useQuery({
    queryKey: ["source-categories"],
    queryFn: async () => {
      const res = await fetch("/api/source-categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });
}

export function useCreateSourceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createSourceCategory(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["source-categories"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useUpdateSourceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      updateSourceCategory(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["source-categories"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}

export function useDeleteSourceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSourceCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["source-categories"] });
      queryClient.invalidateQueries({ queryKey: ["sources"] });
    },
  });
}
