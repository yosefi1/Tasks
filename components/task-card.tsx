"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Calendar, GripVertical } from "lucide-react";
import type { TaskWithSteps } from "@/lib/types";
import { format } from "date-fns";
import { useUpdateTaskStep } from "@/lib/hooks/use-tasks";
import { resolveTaskStripeColor } from "@/lib/task-card-colors";
import { cn } from "@/lib/utils";

function StepProgressInput({
  stepId,
  progress,
  onUpdate,
  disabled,
}: {
  stepId: string;
  progress: number;
  onUpdate: (progress: number) => void;
  disabled: boolean;
}) {
  const [value, setValue] = useState(String(progress));
  useEffect(() => {
    setValue(String(progress));
  }, [progress]);

  return (
    <div className="flex shrink-0 items-center gap-1">
      <Input
        type="number"
        min={0}
        max={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          const v = parseInt(value, 10);
          const clamped = Number.isNaN(v) ? progress : Math.min(100, Math.max(0, v));
          setValue(String(clamped));
          if (clamped !== progress) onUpdate(clamped);
        }}
        className="h-8 w-14 px-1 text-center text-xs tabular-nums"
        disabled={disabled}
      />
      <span className="text-muted-foreground text-xs">%</span>
    </div>
  );
}

export type TaskCardViewVariant = "grid" | "list" | "compact";

type TaskCardProps = {
  task: TaskWithSteps;
  onCardClick: (task: TaskWithSteps) => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> | null;
  variant?: TaskCardViewVariant;
  categoryColors?: Record<string, string>;
};

const priorityVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "success" | "warning"> = {
  low: "secondary",
  medium: "warning",
  high: "destructive",
};

const statusVariant: Record<string, "default" | "secondary" | "success" | "outline"> = {
  backlog: "secondary",
  in_progress: "default",
  done: "success",
};

export function TaskCard({
  task,
  onCardClick,
  dragHandleProps,
  variant = "grid",
  categoryColors = {},
}: TaskCardProps) {
  const updateStep = useUpdateTaskStep();
  const statusLabel =
    task.status === "in_progress" ? "In progress" : task.status === "done" ? "Done" : "Backlog";

  const steps = task.steps ?? [];
  const progressFromSteps =
    steps.length > 0
      ? Math.round(
          steps.reduce((sum, s) => sum + (s.progress ?? 0), 0) / steps.length
        )
      : task.progress;

  const stripe = resolveTaskStripeColor(task, categoryColors);

  const isList = variant === "list";
  const isCompact = variant === "compact";

  if (isList) {
    return (
      <Card
        className="flex cursor-pointer flex-row items-stretch overflow-hidden transition-shadow hover:shadow-md"
        onClick={() => onCardClick(task)}
        style={{ borderLeftWidth: 4, borderLeftColor: stripe }}
      >
        {dragHandleProps && (
          <div
            {...dragHandleProps}
            onClick={(e) => e.stopPropagation()}
            className="flex shrink-0 items-center border-r bg-muted/40 px-1 text-muted-foreground hover:bg-muted"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate font-semibold">{task.title}</h3>
              <Badge variant={statusVariant[task.status] ?? "secondary"} className="shrink-0 capitalize">
                {statusLabel}
              </Badge>
              {task.priority && (
                <Badge variant={priorityVariant[task.priority] ?? "outline"} className="shrink-0 capitalize">
                  {task.priority}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-xs capitalize">{task.category}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-sm">
            <span className="tabular-nums text-muted-foreground">{progressFromSteps}%</span>
            {steps.length > 0 && (
              <span className="text-muted-foreground text-xs">{steps.length} steps</span>
            )}
            {task.dueDate && (
              <span className="flex items-center gap-1 text-muted-foreground text-xs">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(task.dueDate), "MMM d")}
              </span>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "flex cursor-pointer flex-col overflow-hidden transition-shadow hover:shadow-md",
        isCompact && "shadow-sm"
      )}
      onClick={() => onCardClick(task)}
      style={{ borderLeftWidth: 4, borderLeftColor: stripe }}
    >
      <CardHeader className={cn("pb-2", isCompact && "p-3 pb-2")}>
        <div className="flex items-start gap-2">
          {dragHandleProps && (
            <div
              {...dragHandleProps}
              onClick={(e) => e.stopPropagation()}
              className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing"
              aria-hidden
            >
              <GripVertical className="h-4 w-4" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3
                className={cn(
                  "font-semibold leading-tight line-clamp-2",
                  isCompact && "text-sm line-clamp-1"
                )}
              >
                {task.title}
              </h3>
              <div className="flex shrink-0 gap-1">
                <Badge variant={statusVariant[task.status] ?? "secondary"} className="capitalize">
                  {statusLabel}
                </Badge>
                {task.priority && (
                  <Badge variant={priorityVariant[task.priority] ?? "outline"} className="capitalize">
                    {task.priority}
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className={cn("mt-1 w-fit capitalize", isCompact && "text-xs")}>
              {task.category}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className={cn("flex-1 space-y-3 pb-2", isCompact && "space-y-2 p-3 pt-0")}>
        {task.description && (
          <p className={cn("text-muted-foreground line-clamp-2 text-sm", isCompact && "line-clamp-1 text-xs")}>
            {task.description}
          </p>
        )}
        {steps.length > 0 && !isCompact && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Steps</p>
            <ul className="space-y-2">
              {steps.map((step) => (
                <li key={step.id} className="flex items-center gap-2 text-sm">
                  <span className="min-w-0 flex-1 truncate" title={step.title}>
                    {step.title}
                  </span>
                  <StepProgressInput
                    stepId={step.id}
                    progress={step.progress ?? 0}
                    onUpdate={(progress) =>
                      updateStep.mutate({ stepId: step.id, data: { progress } })
                    }
                    disabled={updateStep.isPending}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        {steps.length > 0 && isCompact && (
          <p className="text-muted-foreground text-xs">{steps.length} steps — open to edit</p>
        )}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{progressFromSteps}%</span>
          </div>
          <Progress value={progressFromSteps} className={cn("h-2", isCompact && "h-1.5")} />
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
          </div>
        )}
        {(task.links?.length ?? 0) > 0 && !isCompact && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Links</p>
            <ul className="space-y-1">
              {(task.links ?? []).map((link) => (
                <li key={link.id} className="text-sm">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {link.displayName}
                  </a>
                  {link.note && (
                    <p className="truncate text-xs text-muted-foreground" title={link.note}>
                      {link.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
