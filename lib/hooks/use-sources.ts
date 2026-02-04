"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSource,
  updateSource,
  deleteSource,
  bulkCreateSources,
  type SourceFilters,
} from "@/app/actions/sources";
import type { SourceSchema } from "@/lib/validations/source";

function sourcesKey(filters: SourceFilters) {
  return ["sources", filters.category ?? "", filters.type ?? "", filters.search ?? ""] as const;
}

export function useSources(filters: SourceFilters = {}) {
  return useQuery({
    queryKey: sourcesKey(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.type) params.set("type", filters.type);
      if (filters.search) params.set("search", filters.search);
      const res = await fetch(`/api/sources?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch sources");
      return res.json();
    },
  });
}

export function useCreateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SourceSchema) => createSource(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useUpdateSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SourceSchema }) =>
      updateSource(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSource(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }),
  });
}

export function useBulkCreateSources() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      category,
      pastedText,
      type,
    }: {
      category: "private" | "work";
      pastedText: string;
      type?: "site" | "video";
    }) => bulkCreateSources(category, pastedText, type),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sources"] }),
  });
}
