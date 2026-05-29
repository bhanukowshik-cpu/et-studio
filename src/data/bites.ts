import type { BiteStatus } from "@/components/BiteCard";

export type Bite = {
  id: string;
  index: number;
  title: string;
  status: BiteStatus;
  taughtChip?: boolean;
};

export const TOTAL_BITES = 6;

/** Visual state of a numbered bite tile in the Auto Teach picker. */
export type BiteTileState =
  | "idle" // no teaching yet, not selected
  | "selected" // currently selected
  | "available" // has teaching draft (yellow stripe)
  | "available-selected" // teaching available + selected
  | "finalized"; // teaching finalized (green stripe)

export type BiteTile = {
  number: number;
  state: BiteTileState;
};

/** 22 bites total — what's shown in the widget grid. */
export const biteTiles: BiteTile[] = Array.from({ length: 22 }, (_, i) => ({
  number: i + 1,
  state: "idle",
}));

export const bites: Bite[] = [
  {
    id: "b1",
    index: 1,
    title: "Measuring Rectangles with..",
    status: "draft",
  },
  {
    id: "b2",
    index: 2,
    title: "Measuring Rectangles with Different Units",
    status: "draft",
  },
  {
    id: "b3",
    index: 3,
    title: "Counting Square Units Inside Shapes",
    status: "draft",
  },
  {
    id: "b4",
    index: 4,
    title: "Comparing Areas of Different Shapes",
    status: "draft",
  },
  {
    id: "b5",
    index: 5,
    title: "Real-World Area Problems",
    status: "draft",
  },
  {
    id: "b6",
    index: 6,
    title: "Area Review and Practice",
    status: "draft",
  },
];
