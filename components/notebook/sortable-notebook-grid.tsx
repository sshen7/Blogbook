"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { NotebookCard } from "./notebook-card";
import { toast } from "sonner";
import Link from "next/link";

interface Notebook {
  id: string;
  title: string;
  description: string | null;
  coverType: string;
  coverValue: string;
  theme: string;
  sortOrder: number;
  _count: {
    notes: number;
  };
}

interface SortableNotebookGridProps {
  notebooks: Notebook[];
  onReorder: (notebooks: Notebook[]) => void;
}

function SortableNotebookCard({ notebook }: { notebook: Notebook }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: notebook.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <Link href={`/notebook/${notebook.id}`} onClick={(e) => isDragging && e.preventDefault()}>
        <NotebookCard notebook={notebook} />
      </Link>
    </div>
  );
}

export function SortableNotebookGrid({
  notebooks: initialNotebooks,
  onReorder,
}: SortableNotebookGridProps) {
  const [notebooks, setNotebooks] = useState(initialNotebooks);
  const [isReordering, setIsReordering] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setIsReordering(true);

    const oldIndex = notebooks.findIndex((n) => n.id === active.id);
    const newIndex = notebooks.findIndex((n) => n.id === over.id);

    const newNotebooks = arrayMove(notebooks, oldIndex, newIndex);
    
    // Update sortOrder for all items
    const updatedNotebooks = newNotebooks.map((notebook, index) => ({
      ...notebook,
      sortOrder: index,
    }));

    setNotebooks(updatedNotebooks);

    try {
      const response = await fetch("/api/notebooks/reorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: updatedNotebooks.map((n) => ({
            id: n.id,
            sortOrder: n.sortOrder,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("重新排序失败");
      }

      onReorder(updatedNotebooks);
      toast.success("排序已保存");
    } catch (error) {
      toast.error("排序保存失败");
      // Revert to original order
      setNotebooks(initialNotebooks);
    } finally {
      setIsReordering(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={notebooks.map((n) => n.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {notebooks.map((notebook) => (
            <SortableNotebookCard key={notebook.id} notebook={notebook} />
          ))}
        </div>
      </SortableContext>
      {isReordering && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            保存中...
          </div>
        </div>
      )}
    </DndContext>
  );
}
