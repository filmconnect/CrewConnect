"use client";

import { useTransition, useState, useCallback } from "react";
import { useFormState } from "react-dom";
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
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { addClip, removeClip, reorderClips } from "@/actions/clips";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import SubmitButton from "@/components/ui/SubmitButton";
import type { ActionResult } from "@/types";

interface ClipItem {
  id: string;
  title: string;
  description: string;
  url: string;
  isFeatured: boolean;
}

interface ClipsSectionProps {
  clips: ClipItem[];
  plan: string;
}

const CLIP_LIMITS: Record<string, number> = { free: 3, pro: 5 };
const initialState: ActionResult = { success: false };

export default function ClipsSection({ clips: initialClips, plan }: ClipsSectionProps) {
  const limit = CLIP_LIMITS[plan] ?? 3;
  const [clips, setClips] = useState(initialClips);
  const remaining = limit - clips.length;
  const [addState, addAction] = useFormState(addClip, initialState);
  const [showForm, setShowForm] = useState(false);
  const [isReordering, startReorder] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = clips.findIndex((c) => c.id === active.id);
      const newIndex = clips.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(clips, oldIndex, newIndex).map((c, i) => ({
        ...c,
        isFeatured: i === 0,
      }));

      setClips(newOrder);
      startReorder(() => reorderClips(newOrder.map((c) => c.id)));
    },
    [clips]
  );

  return (
    <section className="mt-10">
      <h2 className="text-[16px] font-bold text-[#DBA508] mb-4">
        Showreel & project clips
      </h2>

      {/* Sortable clip list */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={clips.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          <div className={`space-y-3 ${isReordering ? "opacity-70" : ""}`}>
            {clips.map((clip) => (
              <SortableClipCard key={clip.id} clip={clip} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add clip */}
      {remaining > 0 ? (
        <>
          {showForm ? (
            <form action={addAction} className="border border-[#EEE] rounded-lg p-4 mt-3 space-y-3">
              <Input name="title" label="Title" placeholder="Showreel 2026" required />
              <Input
                name="description"
                label="Description"
                placeholder="General showreel - commercials, documentary, narrative"
              />
              <Input
                name="url"
                label="Video URL"
                placeholder="https://vimeo.com/123456789"
                required
              />
              {addState.error ? (
                <p className="text-[13px] text-[#C44B4B]">{addState.error}</p>
              ) : null}
              <div className="flex gap-3">
                <SubmitButton variant="primary">
                  Add clip
                </SubmitButton>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowForm(true)}
              className="w-full mt-3 border-2 border-dashed border-[#EEE] rounded-lg p-4 text-center hover:border-[#DBA508] transition-colors"
            >
              <span className="text-[14px] text-[#DBA508] font-medium">
                + Add video clip
              </span>
              <span className="text-[13px] text-[#888] ml-2">
                {remaining} slot{remaining !== 1 ? "s" : ""} remaining
              </span>
            </button>
          )}
        </>
      ) : (
        <div className="mt-3 border border-[#EEE] rounded-lg p-4 text-center">
          <p className="text-[13px] text-[#888]">
            You&apos;ve used all {limit} clip slots.
            {plan === "free" ? " Upgrade to Pro for 5 clips." : ""}
          </p>
        </div>
      )}
    </section>
  );
}

function SortableClipCard({ clip }: { clip: ClipItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: clip.id });

  const [isRemoving, startTransition] = useTransition();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  function handleRemove() {
    if (confirm(`Remove "${clip.title}"?`)) {
      startTransition(() => removeClip(clip.id));
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-[#EEE] rounded-lg p-4 flex gap-4 bg-white"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="self-center text-[#CCC] hover:text-[#888] cursor-grab active:cursor-grabbing px-1 shrink-0"
        aria-label="Drag to reorder"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
          <circle cx="3" cy="4" r="1.5" />
          <circle cx="9" cy="4" r="1.5" />
          <circle cx="3" cy="10" r="1.5" />
          <circle cx="9" cy="10" r="1.5" />
          <circle cx="3" cy="16" r="1.5" />
          <circle cx="9" cy="16" r="1.5" />
        </svg>
      </button>

      {/* Thumbnail */}
      <div className="w-[140px] h-[90px] bg-[#111] rounded-md flex items-center justify-center shrink-0">
        <span className="text-[24px] text-[#DBA508]">▶</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[14px] font-bold">{clip.title}</p>
            {clip.description ? (
              <p className="text-[13px] text-[#888] mt-0.5">{clip.description}</p>
            ) : null}
            <p className="text-[12px] text-[#DBA508] mt-1 truncate">{clip.url}</p>
          </div>
          {clip.isFeatured ? (
            <span className="bg-[#FFF8E1] text-[#8B6508] text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border border-[#F5E6A3] shrink-0">
              featured
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-3 mt-2 text-[12px]">
          <button className="text-[#888] hover:text-[#111]">Edit</button>
          <span className="text-[#EEE]">·</span>
          <button
            className="text-[#C44B4B] hover:text-[#a33a3a]"
            onClick={handleRemove}
            disabled={isRemoving}
          >
            {isRemoving ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}
