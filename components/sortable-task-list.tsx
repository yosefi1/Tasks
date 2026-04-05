"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard, type TaskCardViewVariant } from "@/components/task-card";
import type { TaskWithSteps } from "@/lib/types";
import { useUpdateTaskOrder } from "@/lib/hooks/use-tasks";
import { cn } from "@/lib/utils";

type SortableTaskListProps = {
  tasks: TaskWithSteps[];
  onCardClick: (task: TaskWithSteps) => void;
  viewMode?: TaskCardViewVariant;
  categoryColors?: Record<string, string>;
};

function SortableTaskItem({
  task,
  onCardClick,
  viewMode,
  categoryColors,
}: {
  task: TaskWithSteps;
  onCardClick: (task: TaskWithSteps) => void;
  viewMode: TaskCardViewVariant;
  categoryColors: Record<string, string>;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className={isDragging ? "opacity-50" : ""}>
      <TaskCard
        task={task}
        onCardClick={onCardClick}
        dragHandleProps={{ ...attributes, ...listeners }}
        variant={viewMode}
        categoryColors={categoryColors}
      />
    </li>
  );
}

export function SortableTaskList({
  tasks,
  onCardClick,
  viewMode = "grid",
  categoryColors = {},
}: SortableTaskListProps) {
  const updateOrder = useUpdateTaskOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    const reordered = arrayMove(tasks, oldIndex, newIndex);
    updateOrder.mutate(reordered.map((t) => t.id));
  }

  const strategy =
    viewMode === "list" ? verticalListSortingStrategy : rectSortingStrategy;

  const listClass = cn(
    viewMode === "list" && "flex flex-col gap-2",
    viewMode === "grid" && "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
    viewMode === "compact" && "grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={strategy}>
        <ul className={listClass}>
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onCardClick={onCardClick}
              viewMode={viewMode}
              categoryColors={categoryColors}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
