"use client";
import type { BiteTileState } from "@/data/bites";

type Props = {
  number: number;
  state: BiteTileState;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  /** Render a blue dot indicator showing this bite has a saved description or instruction. */
  hasDescription?: boolean;
};

export default function BiteTile({
  number,
  state,
  size = "md",
  onClick,
  draggable = false,
  onDragStart,
  onDragEnd,
  hasDescription = false,
}: Props) {
  // Desktop spec from Figma: W 44 × H 33, number 10px
  const dim =
    size === "sm"
      ? "w-[44px] h-[33px] text-[10px]"
      : size === "lg"
        ? "w-[56px] h-[42px] text-[12px]"
        : "w-[44px] h-[33px] text-[10px]";

  const isSelected = state === "selected" || state === "available-selected";
  const isFinalized = state === "finalized";
  const stripe =
    state === "available" || state === "available-selected"
      ? "bg-[#F4B33E]"
      : isFinalized
        ? "bg-brand"
        : "bg-transparent";

  // Body background and text
  const bodyBg = isSelected
    ? "bg-brand text-white"
    : isFinalized
      ? "bg-white text-ink ring-1 ring-ink/25"
      : "bg-[#F2F2F2] text-ink";

  const interactive = !!onClick || draggable;

  return (
    <button
      type="button"
      onClick={onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`relative rounded-[3px] overflow-hidden ${dim} ${bodyBg} transition-all hover:brightness-95 active:scale-95 ${
        draggable
          ? "cursor-grab active:cursor-grabbing"
          : interactive
            ? "cursor-pointer"
            : "cursor-default"
      }`}
    >
      {/* Stripe overlays the top — doesn't push content down */}
      {(state === "available" ||
        state === "available-selected" ||
        state === "finalized") && (
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${stripe}`} />
      )}
      {/* Number centered across the FULL tile (including stripe area) */}
      <span className="absolute inset-0 flex items-center justify-center font-mulish font-bold leading-none">
        {number}
      </span>
      {/* Blue dot — bite has a saved Bite Description or Specific Instruction */}
      {hasDescription && (
        <span
          className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#2E72E8]"
          aria-label="has description or instructions"
        />
      )}
    </button>
  );
}
