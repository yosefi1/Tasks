"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTask,
  updateTask,
  deleteTask,
  updateTaskOrder,
  createTaskStep,
  updateTaskStep,
  deleteTaskStep,
  createTaskLink,
  updateTaskLink,
  deleteTaskLink,
  type TaskFilters,
} from "@/app/actions/tasks";
import type { TaskSchema } from "@/lib/validations/task";

function tasksKey(filters: TaskFilters) {
  return ["tasks", filters.category ?? "", filters.status ?? "", filters.priority ?? "", filters.search ?? "", filters.orderBy ?? ""] as const;
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: tasksKey(filters),
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.set("category", filters.category);
      if (filters.status) params.set("status", filters.status);
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.search) params.set("search", filters.search);
      if (filters.orderBy) params.set("orderBy", filters.orderBy);
      const res = await fetch(`/api/tasks?${params.toString()}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg = typeof data?.error === "string" ? data.error : "Failed to load tasks";
        throw new Error(msg);
      }
      return data;
    },
  });
}

export function useUpdateTaskOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => updateTaskOrder(orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateTaskStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      title,
      progress = 0,
    }: {
      taskId: string;
      title: string;
      progress?: number;
    }) => createTaskStep(taskId, title, progress),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      stepId,
      data,
    }: {
      stepId: string;
      data: { title?: string; completed?: boolean; progress?: number };
    }) => updateTaskStep(stepId, data),
    onMutate: async ({ stepId, data }) => {
      if (data.progress === undefined) return;
      const previous = queryClient.getQueriesData({ queryKey: ["tasks"] });
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old: unknown) => {
        if (!Array.isArray(old)) return old;
        return old.map((task: { id: string; steps?: { id: string; progress?: number }[] }) => {
          const step = task.steps?.find((s) => s.id === stepId);
          if (!step) return task;
          const steps = task.steps!.map((s) =>
            s.id === stepId ? { ...s, progress: data.progress! } : s
          );
          const progress = Math.round(
            steps.reduce((sum, s) => sum + (s.progress ?? 0), 0) / steps.length
          );
          return { ...task, steps, progress };
        });
      });
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous)
        context.previous.forEach(([key, data]) =>
          queryClient.setQueryData(key, data)
        );
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTaskStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (stepId: string) => deleteTaskStep(stepId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateTaskLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: { url: string; displayName: string; note?: string };
    }) => createTaskLink(taskId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTaskLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      linkId,
      data,
    }: {
      linkId: string;
      data: { url?: string; displayName?: string; note?: string };
    }) => updateTaskLink(linkId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTaskLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => deleteTaskLink(linkId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TaskSchema) => createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskSchema }) =>
      updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
