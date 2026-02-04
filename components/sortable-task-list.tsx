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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "@/components/task-card";
import type { TaskWithSteps } from "@/lib/types";
import { useUpdateTaskOrder } from "@/lib/hooks/use-tasks";

type SortableTaskListProps = {
  tasks: TaskWithSteps[];
  onCardClick: (task: TaskWithSteps) => void;
};

function SortableTaskItem({
  task,
  onCardClick,
}: {
  task: TaskWithSteps;
  onCardClick: (task: TaskWithSteps) => void;
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
      />
    </li>
  );
}

export function SortableTaskList({ tasks, onCardClick }: SortableTaskListProps) {
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

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <SortableTaskItem
              key={task.id}
              task={task}
              onCardClick={onCardClick}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
