"use client";
import { IconClose, IconSparkle, IconEdit } from "./icons";
import BiteTile from "./BiteTile";
import { biteTiles, type BiteTileState } from "@/data/bites";

export type TeachingStyle = "default" | "instruction" | "practice" | "review";

export type StyleSlot = {
  id: TeachingStyle;
  label: string;
  bites: number[]; // bite numbers dropped here
  checkIns: boolean;
};

type Props = {
  /** Which tiles 1..22 are selected (by number). */
  selectedNumbers?: number[];
  /** Per-bite state overrides (number → state). */
  tileStates?: Partial<Record<number, BiteTileState>>;
  styleSlots?: StyleSlot[];
  autoTeachAll?: boolean;
  finalizedAfter?: "finalized" | "draft";
  ctaEnabled?: boolean;
  errorToast?: string | null;
  showInstructions?: boolean;
};

const defaultSlots: StyleSlot[] = [
  { id: "default", label: "Default", bites: [], checkIns: true },
  { id: "instruction", label: "Instruction", bites: [], checkIns: true },
  { id: "practice", label: "Practice", bites: [], checkIns: true },
  { id: "review", label: "Review", bites: [], checkIns: true },
];

export default function AutoTeachSheet({
  selectedNumbers = [],
  tileStates = {},
  styleSlots = defaultSlots,
  autoTeachAll = false,
  finalizedAfter = "finalized",
  ctaEnabled = false,
  errorToast = null,
  showInstructions = false,
}: Props) {
  return (
    <aside className="fixed right-6 top-[96px] bottom-6 w-[400px] z-30 bg-white rounded-2xl ring-1 ring-ink-line shadow-pop flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <h3 className="text-[15px] font-semibold text-ink">
          Auto Teach your bites
        </h3>
        <button
          className="text-ink-mute hover:text-ink"
          aria-label="Close"
          type="button"
        >
          <IconClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-3 space-y-5">
        {/* Choose the bites */}
        <section>
          <div className="text-[12px] text-ink-soft font-medium mb-2">
            Choose the bites
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {biteTiles.slice(0, 14).map((t) => {
              const state =
                tileStates[t.number] ??
                (selectedNumbers.includes(t.number) ? "selected" : "idle");
              return (
                <BiteTile
                  key={t.number}
                  number={t.number}
                  state={state}
                  size="sm"
                />
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <button
              type="button"
              className="text-[11px] text-brand-700 font-medium hover:underline"
            >
              + Load More
            </button>
            <span className="text-[11px] text-ink-mute">22 bites available</span>
          </div>
        </section>

        {/* Drop area / styles */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <div className="text-[12px] text-ink-soft font-medium leading-tight">
              Drop in bites / Select the teaching style for the bites
            </div>
            <button
              type="button"
              className="text-[11px] text-brand-700 font-medium hover:underline shrink-0 ml-2"
            >
              Instruction Sheet
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {styleSlots.map((s) => (
              <StyleCard key={s.id} slot={s} />
            ))}
          </div>
        </section>

        {/* Auto teach all toggle */}
        <section>
          <div
            className={`rounded-lg border ${
              autoTeachAll ? "border-brand bg-brand-50/40" : "border-ink-line"
            } px-3 py-2.5 flex items-center justify-between`}
          >
            <div className="flex items-center gap-2.5">
              <ToggleDot on={autoTeachAll} />
              <span className="text-[12.5px] text-ink font-medium">
                Auto teach all bites
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-ink-mute">
              Default
              <button type="button" className="hover:text-ink">
                <IconEdit size={12} />
              </button>
            </div>
          </div>
        </section>

        {/* Finalized / Draft toggle */}
        <section>
          <div className="flex items-center justify-between">
            <div className="text-[12px] text-ink-soft font-medium leading-tight max-w-[180px]">
              All Auto-Taught lessons should be
            </div>
            <SegmentToggle value={finalizedAfter} />
          </div>
        </section>

        {showInstructions && (
          <section className="rounded-lg bg-surface-alt p-3 text-[12px] text-ink-soft leading-relaxed">
            <strong className="text-ink">Instructions:</strong> Drag bites from
            the grid into one of the teaching style cards. Toggle{" "}
            <em>Check-in&apos;s</em> per style to insert comprehension checks.
          </section>
        )}
      </div>

      {/* Error toast (above CTA) */}
      {errorToast && (
        <div className="mx-4 mb-3 rounded-lg bg-[#FFEDEC] border border-[#F1B7B0] text-[#C0392B] px-3 py-2.5 flex items-center gap-2">
          <span className="text-[12px] font-medium flex-1">{errorToast}</span>
          <button
            type="button"
            aria-label="Dismiss"
            className="w-5 h-5 rounded-full bg-[#C0392B] text-white flex items-center justify-center hover:bg-[#A82E20]"
          >
            <IconClose size={12} />
          </button>
        </div>
      )}

      {/* CTA */}
      <div className="p-4 border-t border-ink-line">
        <button
          type="button"
          disabled={!ctaEnabled}
          className={`w-full h-[42px] rounded-lg text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors ${
            ctaEnabled
              ? "bg-brand text-white hover:bg-brand-600"
              : "bg-brand-50 text-brand-700/60 cursor-not-allowed"
          }`}
        >
          <IconSparkle size={16} />
          Auto Teach
        </button>
      </div>
    </aside>
  );
}

function StyleCard({ slot }: { slot: StyleSlot }) {
  const hasBites = slot.bites.length > 0;
  return (
    <div className="flex flex-col">
      <div
        className={`rounded-xl flex items-center justify-center min-h-[78px] px-3 py-3 ${
          hasBites
            ? "border-2 border-brand bg-brand-50/30 border-dashed"
            : "border-2 border-dashed border-brand/40"
        }`}
      >
        {hasBites ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <span className="font-mulish text-[12px] font-bold text-ink">
              {slot.label}
            </span>
            <div className="flex flex-wrap gap-1 justify-center">
              {slot.bites.map((n) => (
                <BiteTile key={n} number={n} state="selected" size="sm" />
              ))}
            </div>
          </div>
        ) : (
          <span className="font-mulish text-[12px] font-bold text-ink">
            {slot.label}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-2 px-1">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-ink-soft font-medium">
            Check-in&apos;s
          </span>
          <span
            className={`inline-block w-[30px] h-[16px] rounded-full relative ${
              slot.checkIns ? "bg-brand" : "bg-ink-line"
            }`}
          >
            <span
              className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow ${
                slot.checkIns ? "left-[15px]" : "left-0.5"
              }`}
            />
          </span>
        </div>
        <span className="text-brand leading-none px-1">
          <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
            <circle cx="2" cy="2" r="1.6" />
            <circle cx="8" cy="2" r="1.6" />
            <circle cx="14" cy="2" r="1.6" />
          </svg>
        </span>
      </div>
    </div>
  );
}

function ToggleDot({ on }: { on: boolean }) {
  return (
    <span
      className={`w-8 h-[18px] rounded-full relative transition-colors ${
        on ? "bg-brand" : "bg-ink-line"
      }`}
    >
      <span
        className={`absolute top-0.5 w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${
          on ? "left-[16px]" : "left-0.5"
        }`}
      />
    </span>
  );
}

function SegmentToggle({ value }: { value: "finalized" | "draft" }) {
  return (
    <div className="flex bg-surface-alt rounded-md p-0.5 border border-ink-line">
      <span
        className={`px-2.5 py-1 text-[11px] font-medium rounded ${
          value === "finalized"
            ? "bg-brand text-white"
            : "text-ink-soft"
        }`}
      >
        Finalized
      </span>
      <span
        className={`px-2.5 py-1 text-[11px] font-medium rounded ${
          value === "draft" ? "bg-brand text-white" : "text-ink-soft"
        }`}
      >
        Draft
      </span>
    </div>
  );
}
