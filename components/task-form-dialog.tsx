"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskSchema, type TaskSchema } from "@/lib/validations/task";
import type { TaskWithSteps } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import {
  useCreateTask,
  useUpdateTask,
  useCreateTaskStep,
  useUpdateTaskStep,
  useDeleteTaskStep,
  useCreateTaskLink,
  useDeleteTaskLink,
} from "@/lib/hooks/use-tasks";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ColorPresetRow } from "@/components/color-preset-row";

type TaskFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: TaskWithSteps | null;
  filters: { category?: string; status?: string; priority?: string; search?: string };
  onDelete?: (task: TaskWithSteps) => void;
};

const categoryOptions = [
  { value: "personal", label: "Personal" },
  { value: "work", label: "Work" },
];

const statusOptions = [
  { value: "backlog", label: "Backlog" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

const priorityOptions = [
  { value: "none", label: "None" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  filters,
  onDelete,
}: TaskFormDialogProps) {
  const { toast } = useToast();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const createStep = useCreateTaskStep();
  const updateStep = useUpdateTaskStep();
  const deleteStep = useDeleteTaskStep();
  const createLink = useCreateTaskLink();
  const deleteLink = useDeleteTaskLink();
  const isEdit = !!task?.id;

  const [newStepTitle, setNewStepTitle] = useState("");
  const [newStepProgress, setNewStepProgress] = useState(0);
  const [pendingSteps, setPendingSteps] = useState<{ title: string; progress: number }[]>([]);
  const [newLinkDisplayName, setNewLinkDisplayName] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkNote, setNewLinkNote] = useState("");
  const [pendingLinks, setPendingLinks] = useState<{ displayName: string; url: string; note?: string }[]>([]);

  const form = useForm<TaskSchema>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "personal",
      status: "backlog",
      progress: 0,
      dueDate: "",
      priority: "none",
      accentColor: "",
    },
  });

  const steps = task?.steps ?? [];
  const hasSteps = isEdit ? steps.length > 0 : pendingSteps.length > 0;
  const totalSteps = isEdit ? steps.length : pendingSteps.length;
  const progressFromSteps =
    totalSteps > 0
      ? Math.round(
          (isEdit
            ? steps.reduce((sum, s) => sum + (s.progress ?? 0), 0)
            : pendingSteps.reduce((sum, s) => sum + s.progress, 0)
          ) / totalSteps
        )
      : 0;

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        description: task.description ?? "",
        category: task.category as "personal" | "work",
        status: task.status as "backlog" | "in_progress" | "done",
        progress: task.progress,
        dueDate: task.dueDate
          ? format(new Date(task.dueDate), "yyyy-MM-dd")
          : "",
        priority: (task.priority as "low" | "medium" | "high") ?? "none",
        accentColor:
          task.accentColor && /^#[0-9A-Fa-f]{6}$/.test(task.accentColor) ? task.accentColor : "",
      });
      setPendingSteps([]);
      setPendingLinks([]);
    } else {
      form.reset({
        title: "",
        description: "",
        category: (filters.category as "personal" | "work") ?? "personal",
        status: (filters.status as "backlog" | "in_progress" | "done") ?? "backlog",
        progress: 0,
        dueDate: "",
        priority: (filters.priority as "low" | "medium" | "high") ?? "none",
        accentColor: "",
      });
      setPendingSteps([]);
      setNewStepTitle("");
      setNewStepProgress(0);
      setPendingLinks([]);
      setNewLinkDisplayName("");
      setNewLinkUrl("");
      setNewLinkNote("");
    }
  }, [task, open, filters, form]);

  async function onSubmit(values: TaskSchema) {
    const progressToSave = hasSteps ? progressFromSteps : values.progress ?? 0;

    if (isEdit && task) {
      const result = await updateTask.mutateAsync({
        id: task.id,
        data: { ...values, progress: progressToSave },
      });
      if (result.error) {
        toast({
          title: "Validation error",
          description: "Please fix the form errors.",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Task updated",
        description: "Your task has been updated.",
        variant: "success",
      });
    } else {
      const result = await createTask.mutateAsync({
        ...values,
        progress: progressToSave,
      });
      if (result.error) {
        toast({
          title: "Validation error",
          description: "Please fix the form errors.",
          variant: "destructive",
        });
        return;
      }
      const createdId = result.data?.id;
      if (createdId) {
        for (const s of pendingSteps) {
          await createStep.mutateAsync({
            taskId: createdId,
            title: s.title,
            progress: s.progress,
          });
        }
        for (const link of pendingLinks) {
          await createLink.mutateAsync({
            taskId: createdId,
            data: { url: link.url, displayName: link.displayName, note: link.note },
          });
        }
      }
      toast({
        title: "Task created",
        description: "Your task has been created.",
        variant: "success",
      });
    }
    onOpenChange(false);
  }

  function handleAddStep() {
    const title = newStepTitle.trim();
    if (!title) return;
    if (isEdit && task) {
      createStep.mutateAsync({
        taskId: task.id,
        title,
        progress: Math.min(100, Math.max(0, newStepProgress)),
      });
      setNewStepTitle("");
      setNewStepProgress(0);
    } else {
      setPendingSteps((prev) => [
        ...prev,
        { title, progress: Math.min(100, Math.max(0, newStepProgress)) },
      ]);
      setNewStepTitle("");
      setNewStepProgress(0);
    }
  }

  function handleRemoveStep(stepId: string | number) {
    if (isEdit && typeof stepId === "string") {
      deleteStep.mutate(stepId);
    } else if (!isEdit && typeof stepId === "number") {
      setPendingSteps((prev) => prev.filter((_, i) => i !== stepId));
    }
  }

  const links = task?.links ?? [];
  const displayLinks = isEdit ? links : pendingLinks;

  function handleAddLink() {
    const displayName = newLinkDisplayName.trim();
    const url = newLinkUrl.trim();
    if (!url) return;
    if (isEdit && task) {
      createLink.mutate({
        taskId: task.id,
        data: { url, displayName: displayName || url, note: newLinkNote.trim() || undefined },
      });
      setNewLinkDisplayName("");
      setNewLinkUrl("");
      setNewLinkNote("");
    } else {
      setPendingLinks((prev) => [
        ...prev,
        { url, displayName: displayName || url, note: newLinkNote.trim() || undefined },
      ]);
      setNewLinkDisplayName("");
      setNewLinkUrl("");
      setNewLinkNote("");
    }
  }

  function handleRemoveLink(linkId: string | number) {
    if (isEdit && typeof linkId === "string") {
      deleteLink.mutate(linkId);
    } else if (!isEdit && typeof linkId === "number") {
      setPendingLinks((prev) => prev.filter((_, i) => i !== linkId));
    }
  }

  const isPending =
    createTask.isPending ||
    updateTask.isPending ||
    createStep.isPending ||
    deleteStep.isPending ||
    createLink.isPending ||
    deleteLink.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Task title"
              {...form.register("title")}
              className={form.formState.errors.title ? "border-destructive" : ""}
            />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description"
              rows={3}
              {...form.register("description")}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) => form.setValue("category", v as "personal" | "work")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(v) =>
                  form.setValue("status", v as "backlog" | "in_progress" | "done")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Steps (set % per step; task progress = average)</Label>
            {(isEdit ? steps : pendingSteps).length > 0 && (
              <ul className="space-y-2 rounded-md border bg-muted/30 p-2">
                {(isEdit ? steps : pendingSteps).map((step, index) => (
                  <li
                    key={isEdit ? step.id : index}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="min-w-0 flex-1 truncate">
                      {isEdit ? step.title : step.title}
                    </span>
                    {isEdit && "id" in step ? (
                      <>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="h-8 w-14 px-1 text-center text-xs tabular-nums"
                          value={step.progress ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v))
                              updateStep.mutate({
                                stepId: step.id,
                                data: { progress: Math.min(100, Math.max(0, v)) },
                              });
                          }}
                        />
                        <span className="text-muted-foreground text-xs w-4">%</span>
                      </>
                    ) : (
                      <>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className="h-8 w-14 px-1 text-center text-xs tabular-nums"
                          value={step.progress}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            if (!Number.isNaN(v)) {
                              setPendingSteps((prev) =>
                                prev.map((s, i) =>
                                  i === index
                                    ? { ...s, progress: Math.min(100, Math.max(0, v)) }
                                    : s
                                )
                              );
                            }
                          }}
                        />
                        <span className="text-muted-foreground text-xs w-4">%</span>
                      </>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveStep(isEdit ? step.id : index)}
                      aria-label="Remove step"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex gap-2 items-center">
              <Input
                placeholder="Add a step..."
                value={newStepTitle}
                onChange={(e) => setNewStepTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddStep())}
                className="flex-1"
              />
              <Input
                type="number"
                min={0}
                max={100}
                placeholder="%"
                className="h-9 w-14 px-1 text-center text-xs tabular-nums"
                value={newStepProgress}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!Number.isNaN(v)) setNewStepProgress(Math.min(100, Math.max(0, v)));
                }}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddStep} aria-label="Add step">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {hasSteps && (
              <p className="text-xs text-muted-foreground">
                Progress from steps: {progressFromSteps}%
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Links (name, URL, optional note)</Label>
            {displayLinks.length > 0 && (
              <ul className="space-y-2 rounded-md border bg-muted/30 p-2">
                {displayLinks.map((link, index) => (
                  <li key={isEdit && "id" in link ? link.id : index} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium">{link.displayName}</span>
                    <span className="text-muted-foreground truncate max-w-[120px] text-xs" title={link.url}>
                      {link.url}
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0 text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveLink(isEdit && "id" in link ? link.id : index)}
                      aria-label="Remove link"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Link name (e.g. Facebook reel)"
                  value={newLinkDisplayName}
                  onChange={(e) => setNewLinkDisplayName(e.target.value)}
                  className="flex-1 min-w-[120px]"
                />
                <Input
                  placeholder="URL"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                  className="flex-1 min-w-[120px]"
                />
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="Note (optional)"
                  value={newLinkNote}
                  onChange={(e) => setNewLinkNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddLink())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="icon" onClick={handleAddLink} aria-label="Add link">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {!hasSteps && (
              <div className="space-y-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  min={0}
                  max={100}
                  {...form.register("progress")}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" type="date" {...form.register("dueDate")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select
              value={form.watch("priority") ?? "none"}
              onValueChange={(v) =>
                form.setValue("priority", v as "low" | "medium" | "high" | "none")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Optional priority" />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>Card color (optional)</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                onClick={() => form.setValue("accentColor", "")}
              >
                Use tab default
              </Button>
            </div>
            <ColorPresetRow
              value={form.watch("accentColor") ?? ""}
              onChange={(v) => form.setValue("accentColor", v, { shouldValidate: true, shouldDirty: true })}
            />
            {form.formState.errors.accentColor && (
              <p className="text-sm text-destructive">{form.formState.errors.accentColor.message}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0 flex-wrap">
            {isEdit && task && onDelete && (
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                onClick={() => {
                  onOpenChange(false);
                  onDelete(task);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEdit ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
