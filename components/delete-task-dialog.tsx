"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useDeleteTask } from "@/lib/hooks/use-tasks";
import type { Task } from "@prisma/client";

type DeleteTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
};

export function DeleteTaskDialog({
  open,
  onOpenChange,
  task,
}: DeleteTaskDialogProps) {
  const { toast } = useToast();
  const deleteTask = useDeleteTask();

  async function handleConfirm() {
    if (!task) return;
    await deleteTask.mutateAsync(task.id);
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
      variant: "default",
    });
    onOpenChange(false);
  }

  const isPending = deleteTask.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete task</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">
          Are you sure you want to delete &quot;{task?.title}&quot;? This action
          cannot be undone.
        </p>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
