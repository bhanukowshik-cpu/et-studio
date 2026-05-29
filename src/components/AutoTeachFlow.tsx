"use client";

import {
  Fragment,
  useState,
  useCallback,
  useRef,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import AppShell from "./AppShell";
import LessonsView from "./LessonsView";
import AutoTeachFab from "./AutoTeachFab";
import BiteTile from "./BiteTile";
import ProgressBanner from "./ProgressBanner";
import Modal from "./Modal";
import { biteTiles, type BiteTileState } from "@/data/bites";
import { IconClose, IconSparkle, IconEdit } from "./icons";
import InstructionsSheetModal from "./InstructionsSheetModal";

type StyleId = "default" | "instruction" | "practice" | "review";

type Slots = Record<StyleId, number[]>;

const STYLE_LABELS: Record<StyleId, string> = {
  default: "Default",
  instruction: "Instruction",
  practice: "Practice",
  review: "Review",
};

const INITIAL_TILE_STATES: Partial<Record<number, BiteTileState>> = {
  // some bites already finalized to demo the locked state
  2: "finalized",
  7: "finalized",
  // some bites already have teaching available (draft)
  3: "available",
  9: "available",
};

const emptySlots: Slots = {
  default: [],
  instruction: [],
  practice: [],
  review: [],
};

export default function AutoTeachFlow() {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [slots, setSlots] = useState<Slots>(emptySlots);
  const [autoTeachAll, setAutoTeachAll] = useState(false);
  const [finalizeMode, setFinalizeMode] = useState<"finalized" | "draft">(
    "finalized",
  );
  const [error, setError] = useState<
    | { message: string; place: "bites" | "slots" }
    | null
  >(null);
  const showBitesError = (m: string) =>
    setError({ message: m, place: "bites" });
  const showSlotsError = (m: string) =>
    setError({ message: m, place: "slots" });
  const [draggedTile, setDraggedTile] = useState<number | null>(null);
  const [overSlot, setOverSlot] = useState<StyleId | null>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [completed, setCompleted] = useState(0);
  const [checkIns, setCheckIns] = useState<Record<StyleId, boolean>>({
    default: false,
    instruction: false,
    practice: false,
    review: false,
  });
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showNotTaughtModal, setShowNotTaughtModal] = useState(false);
  const [showInstructionsSheet, setShowInstructionsSheet] = useState(false);
  const [showAllBites, setShowAllBites] = useState(false);
  const [removePopover, setRemovePopover] = useState<
    | { slot: StyleId; n: number; top: number; left: number }
    | null
  >(null);
  const [autoTeachEditorOpen, setAutoTeachEditorOpen] = useState(false);
  // Per-slot description editor: { slot, kind } | null
  const [descriptionEditor, setDescriptionEditor] = useState<
    { slot: StyleId; kind: "bite" | "instructions" } | null
  >(null);
  // Saved bite descriptions keyed by `${slotId}:${target}` — seeded with a couple of
  // pre-existing descriptions so the blue indicator is visible from launch.
  const [biteDescriptions, setBiteDescriptions] = useState<
    Record<string, string>
  >({
    "default:4": "Recap the previous bite's key idea before introducing the formula.",
    "default:11": "Use a simple worked example before letting the student practice.",
    "instruction:6": "Spell out each step of the method.",
  });
  // Saved specific instructions keyed by `${slotId}:${target}`
  const [specificInstructions, setSpecificInstructions] = useState<
    Record<string, string>
  >({
    "default:5": "Speak slowly and pause for student replies.",
  });

  // Collapse to ["all"] when *every* current bite in the slot has the same non-empty
  // description, otherwise return the list of bites that actually have descriptions.
  // This makes the "All" chip disappear and individual chips appear once a new bite
  // (without a description) is dropped into the slot.
  const computeTargets = useCallback(
    (store: Record<string, string>, slotId: StyleId): (number | "all")[] => {
      const bitesInSlot = slots[slotId];
      if (bitesInSlot.length === 0) return [];
      const withDesc = bitesInSlot.filter(
        (n) => (store[`${slotId}:${n}`] || "").trim().length > 0,
      );
      if (
        withDesc.length === bitesInSlot.length &&
        withDesc.length > 0
      ) {
        const first = store[`${slotId}:${withDesc[0]}`];
        if (withDesc.every((n) => store[`${slotId}:${n}`] === first)) {
          return ["all"];
        }
      }
      return withDesc;
    },
    [slots],
  );

  const savedBiteTargetsFor = useCallback(
    (slotId: StyleId) => computeTargets(biteDescriptions, slotId),
    [biteDescriptions, computeTargets],
  );
  const savedInstructionTargetsFor = useCallback(
    (slotId: StyleId) => computeTargets(specificInstructions, slotId),
    [specificInstructions, computeTargets],
  );

  const anyDescriptionExists =
    Object.values(biteDescriptions).some((v) => v?.trim().length > 0) ||
    Object.values(specificInstructions).some((v) => v?.trim().length > 0);

  // True when bite N has *any* saved description or instruction, in any slot.
  // Used to render the blue indicator dot on tiles — persists even after the
  // bite is removed from a slot.
  const biteHasAnyDescription = useCallback(
    (n: number): boolean => {
      const styles = Object.keys(STYLE_LABELS) as StyleId[];
      for (const s of styles) {
        if ((biteDescriptions[`${s}:${n}`] || "").trim()) return true;
        if ((specificInstructions[`${s}:${n}`] || "").trim()) return true;
      }
      return false;
    },
    [biteDescriptions, specificInstructions],
  );
  const widgetBodyRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll the widget body to the bottom when the editor opens.
  useLayoutEffect(() => {
    if (autoTeachEditorOpen && widgetBodyRef.current) {
      const el = widgetBodyRef.current;
      requestAnimationFrame(() => {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      });
    }
  }, [autoTeachEditorOpen]);

  /* ----- derived state ----- */
  const TOTAL_BITES_AVAILABLE = 22;
  const slotted = new Set([
    ...slots.default,
    ...slots.instruction,
    ...slots.practice,
    ...slots.review,
  ]);
  const totalAssigned = slotted.size;
  // Bites that can be assigned (not finalized).
  const assignableCount =
    TOTAL_BITES_AVAILABLE -
    Object.values(INITIAL_TILE_STATES).filter((s) => s === "finalized").length;
  const allBitesPlaced = totalAssigned >= assignableCount;
  const ctaEnabled =
    phase === "idle" &&
    (autoTeachAll ? allBitesPlaced : totalAssigned > 0);

  const tileState = useCallback(
    (n: number): BiteTileState => {
      const base = INITIAL_TILE_STATES[n];
      const isSelected = selected.has(n) || slotted.has(n);
      if (base === "finalized") return "finalized";
      if (base === "available") {
        return isSelected ? "available-selected" : "available";
      }
      return isSelected ? "selected" : "idle";
    },
    [selected, slotted],
  );

  /* ----- actions ----- */
  const toggleTile = (n: number) => {
    setError(null);
    if (INITIAL_TILE_STATES[n] === "finalized") {
      showBitesError(
        `Bite ${n} is finalized, to teach it again change status to draft`,
      );
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const removeFromSlot = (style: StyleId, n: number) => {
    setSlots((prev) => ({
      ...prev,
      [style]: prev[style].filter((x) => x !== n),
    }));
  };

  const dropOnSlot = (style: StyleId, n: number) => {
    setSlots((prev) => {
      // remove from any existing slot
      const cleaned: Slots = {
        default: prev.default.filter((x) => x !== n),
        instruction: prev.instruction.filter((x) => x !== n),
        practice: prev.practice.filter((x) => x !== n),
        review: prev.review.filter((x) => x !== n),
      };
      cleaned[style] = [...cleaned[style], n];
      return cleaned;
    });
    // remove from temp selection — it's now assigned
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(n);
      return next;
    });
  };

  const reset = () => {
    setSelected(new Set());
    setSlots(emptySlots);
    setAutoTeachAll(false);
    setPhase("idle");
    setCompleted(0);
    setError(null);
  };

  const startAutoTeach = () => {
    if (!ctaEnabled) return;
    const total = autoTeachAll ? 6 : totalAssigned;
    setPhase("running");
    setCompleted(0);
    let i = 0;
    const tick = () => {
      i += 1;
      setCompleted(i);
      if (i < total) {
        setTimeout(tick, 1000);
      } else {
        setPhase("done");
      }
    };
    setTimeout(tick, 800);
  };

  const totalToRun = autoTeachAll ? 6 : totalAssigned;

  /* ----- render ----- */
  return (
    <AppShell sidebarDisabled={phase === "running"}>
      {phase === "running" && (
        <ProgressBanner completed={completed} total={totalToRun} />
      )}
      {phase === "done" && (
        <div className="max-w-[1080px] mx-auto mb-5">
          <div className="bg-brand-50 ring-1 ring-brand/40 rounded-xl px-5 py-3.5 flex items-center gap-3">
            <span className="text-brand-700">
              <IconSparkle size={18} />
            </span>
            <div className="flex-1">
              <div className="font-mulish text-[13px] font-semibold text-brand-700">
                Teaching completed
              </div>
            </div>
          </div>
        </div>
      )}

      <LessonsView
        bites={undefined}
        allTeachDisabled={phase === "running"}
        taughtVariants={
          phase === "done"
            ? { b1: "finalized", b2: "draft" }
            : undefined
        }
      />

      {/* FAB */}
      {!widgetOpen && (
        <AutoTeachFab
          onClick={() => setWidgetOpen(true)}
          variant={phase === "running" ? "progress" : "default"}
        />
      )}

      {/* Widget */}
      {widgetOpen && (
        <aside className="fixed right-6 bottom-6 max-h-[calc(100vh-120px)] w-[400px] z-30 bg-white rounded-2xl ring-1 ring-ink-line shadow-pop flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-ink-line">
            <h3 className="font-mulish text-[20px] font-bold text-ink leading-none">
              Auto Teach your bites
            </h3>
            <button
              className="text-ink-mute hover:text-ink"
              aria-label="Close"
              type="button"
              onClick={() => setWidgetOpen(false)}
            >
              <IconClose size={18} />
            </button>
          </div>

          <div
            ref={widgetBodyRef}
            className={`overflow-y-auto px-5 pb-2 space-y-4 ${phase === "running" ? "opacity-50 pointer-events-none" : ""}`}
          >
            <div
              className={`space-y-4 ${autoTeachEditorOpen ? "opacity-40 pointer-events-none" : ""}`}
            >
            {/* Choose bites */}
            <section>
              <div className="font-mulish text-[10px] text-ink font-bold mb-2">
                Choose the bites
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3">
                <LegendDot color="#F4B33E" label="Teaching available but not finalized" />
                <LegendDot color="var(--brand)" label="Finalized (Locked)" />
                {anyDescriptionExists && (
                  <LegendDot
                    color="#2E72E8"
                    label="Bite / Specific Instructions available"
                  />
                )}
              </div>
              <div className="grid grid-cols-7 gap-x-2 gap-y-2">
                {(() => {
                  const unplaced = biteTiles.filter(
                    (t) => !slotted.has(t.number),
                  );
                  return showAllBites ? unplaced : unplaced.slice(0, 14);
                })().map((t) => {
                  const state = tileState(t.number);
                  const isFinalized =
                    INITIAL_TILE_STATES[t.number] === "finalized";
                  return (
                    <BiteTile
                      key={t.number}
                      number={t.number}
                      state={state}
                      size="sm"
                      hasDescription={biteHasAnyDescription(t.number)}
                      onClick={() => toggleTile(t.number)}
                      draggable
                      onDragStart={(e) => {
                        if (isFinalized) {
                          // Block the drag and surface the same toast as a click
                          e.preventDefault();
                          showBitesError(
                            `Bite ${t.number} is finalized, to teach it again change status to draft`,
                          );
                          return;
                        }
                        setDraggedTile(t.number);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData(
                          "text/plain",
                          String(t.number),
                        );
                      }}
                      onDragEnd={() => {
                        setDraggedTile(null);
                        setOverSlot(null);
                      }}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={() => setShowAllBites((v) => !v)}
                  className="text-[12px] text-brand-700 font-semibold hover:underline"
                >
                  {showAllBites ? "− Show less" : "+ Load More"}
                </button>
                <span className="text-[12px] text-ink-mute">
                  {showAllBites
                    ? "Showing 22 of 22"
                    : "22 bites available"}
                </span>
              </div>
              {selected.size > 0 && (
                <div className="mt-2 text-[11px] text-ink-mute">
                  Drag selected tiles into a style card below ↓
                </div>
              )}
              {/* Bite-related errors appear here, right under the Choose Bites grid */}
              {error && error.place === "bites" && (
                <div className="mt-3 rounded-lg bg-[#FFEDEC] border border-[#F1B7B0] text-[#C0392B] px-3 py-2 flex items-center gap-2">
                  <span className="text-[12px] font-medium flex-1">
                    {error.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    aria-label="Dismiss"
                    className="w-5 h-5 rounded-full bg-[#C0392B] text-white flex items-center justify-center hover:bg-[#A82E20] shrink-0"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
              )}
            </section>

            {/* Drop slots */}
            <section className="pt-4 border-t border-ink-line">
              <div className="flex items-center justify-between mb-2.5">
                <div className="font-mulish text-[10px] text-ink font-semibold leading-snug">
                  Drop in bites / Select the teaching style for the bites
                </div>
                <button
                  type="button"
                  onClick={() => setShowInstructionsSheet(true)}
                  className="font-mulish text-[10px] text-brand-700 font-semibold hover:underline shrink-0 ml-2 whitespace-nowrap"
                >
                  Instruction Sheet
                </button>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                {(Object.keys(STYLE_LABELS) as StyleId[]).map((id, idx) => (
                  <Fragment key={id}>
                    <SlotCard
                      id={id}
                      label={STYLE_LABELS[id]}
                      items={slots[id]}
                      isOver={overSlot === id}
                      checkIn={checkIns[id]}
                      onToggleCheckIn={() => {
                        if (slots[id].length === 0) {
                          showSlotsError(
                            `Drop in bites to enable Check-in's for ${STYLE_LABELS[id]}`,
                          );
                          return;
                        }
                        setError(null);
                        setCheckIns((p) => ({ ...p, [id]: !p[id] }));
                      }}
                      onMenuAction={(action) => {
                        if (slots[id].length === 0) {
                          showSlotsError(
                            `Drop in bites to ${action.toLowerCase()} for ${STYLE_LABELS[id]}`,
                          );
                          return;
                        }
                        setError(null);
                        setDescriptionEditor({
                          slot: id,
                          kind:
                            action === "Add Bite Description"
                              ? "bite"
                              : "instructions",
                        });
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setOverSlot(id);
                      }}
                      onDragLeave={() => {
                        if (overSlot === id) setOverSlot(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const raw = e.dataTransfer.getData("text/plain");
                        const n =
                          draggedTile ?? (raw ? Number(raw) : NaN);
                        if (
                          Number.isFinite(n) &&
                          n > 0 &&
                          INITIAL_TILE_STATES[n] !== "finalized"
                        ) {
                          dropOnSlot(id, n);
                        }
                        setOverSlot(null);
                        setDraggedTile(null);
                      }}
                      onRemove={(n) => removeFromSlot(id, n)}
                      biteHasAnyDescription={biteHasAnyDescription}
                      onRequestRemovePopover={(n, rect) => {
                        const POP_H = 38;
                        const overflowsBottom =
                          rect.bottom + POP_H + 8 > window.innerHeight;
                        setRemovePopover({
                          slot: id,
                          n,
                          top: overflowsBottom
                            ? rect.top - POP_H - 4
                            : rect.bottom + 6,
                          left: Math.max(8, rect.left),
                        });
                      }}
                      onTileDragStart={(n, e) => {
                        setDraggedTile(n);
                        e.dataTransfer.effectAllowed = "move";
                        e.dataTransfer.setData(
                          "text/plain",
                          String(n),
                        );
                        e.dataTransfer.setData(
                          "application/x-from-slot",
                          id,
                        );
                      }}
                      onTileDragEnd={(n, e) => {
                        if (e.dataTransfer.dropEffect === "none") {
                          removeFromSlot(id, n);
                        }
                        setDraggedTile(null);
                        setOverSlot(null);
                      }}
                    />
                    {/* After each row (idx 1 and idx 3): inject chips row, then editor if its slot was in this row */}
                    {idx % 2 === 1 && (
                      <>
                        {(() => {
                          const prev = (Object.keys(STYLE_LABELS) as StyleId[])[
                            idx - 1
                          ];
                          const aBite = savedBiteTargetsFor(prev);
                          const aInstr = savedInstructionTargetsFor(prev);
                          const bBite = savedBiteTargetsFor(id);
                          const bInstr = savedInstructionTargetsFor(id);
                          if (
                            aBite.length === 0 &&
                            aInstr.length === 0 &&
                            bBite.length === 0 &&
                            bInstr.length === 0
                          )
                            return null;
                          return (
                            <>
                              <SavedDescriptionsCell
                                biteTargets={aBite}
                                instructionTargets={aInstr}
                                onOpenBite={() =>
                                  setDescriptionEditor({
                                    slot: prev,
                                    kind: "bite",
                                  })
                                }
                                onOpenInstruction={() =>
                                  setDescriptionEditor({
                                    slot: prev,
                                    kind: "instructions",
                                  })
                                }
                              />
                              <SavedDescriptionsCell
                                biteTargets={bBite}
                                instructionTargets={bInstr}
                                onOpenBite={() =>
                                  setDescriptionEditor({
                                    slot: id,
                                    kind: "bite",
                                  })
                                }
                                onOpenInstruction={() =>
                                  setDescriptionEditor({
                                    slot: id,
                                    kind: "instructions",
                                  })
                                }
                              />
                            </>
                          );
                        })()}
                      </>
                    )}
                    {idx % 2 === 1 &&
                      descriptionEditor &&
                      [
                        (Object.keys(STYLE_LABELS) as StyleId[])[idx - 1],
                        id,
                      ].includes(descriptionEditor.slot) && (
                        <DescriptionPanel
                          slotId={descriptionEditor.slot}
                          slotLabel={STYLE_LABELS[descriptionEditor.slot]}
                          kind={descriptionEditor.kind}
                          bites={slots[descriptionEditor.slot]}
                          descriptions={
                            descriptionEditor.kind === "instructions"
                              ? specificInstructions
                              : biteDescriptions
                          }
                          onSave={(target, text) => {
                            const slot = descriptionEditor.slot;
                            const setter =
                              descriptionEditor.kind === "instructions"
                                ? setSpecificInstructions
                                : setBiteDescriptions;
                            setter((prev) => {
                              const next = { ...prev };
                              if (target === "all") {
                                // Expand to per-bite for every CURRENT bite in slot
                                slots[slot].forEach((n) => {
                                  next[`${slot}:${n}`] = text;
                                });
                              } else {
                                next[`${slot}:${target}`] = text;
                              }
                              return next;
                            });
                          }}
                          onDelete={(target) => {
                            const slot = descriptionEditor.slot;
                            const setter =
                              descriptionEditor.kind === "instructions"
                                ? setSpecificInstructions
                                : setBiteDescriptions;
                            setter((prev) => {
                              const next = { ...prev };
                              if (target === "all") {
                                slots[slot].forEach((n) => {
                                  delete next[`${slot}:${n}`];
                                });
                              } else {
                                delete next[`${slot}:${target}`];
                              }
                              return next;
                            });
                          }}
                          onClose={() => setDescriptionEditor(null)}
                        />
                      )}
                  </Fragment>
                ))}
              </div>

              {/* Slot-related errors appear right under the teaching styles */}
              {error && error.place === "slots" && (
                <div className="mt-3 rounded-lg bg-[#FFEDEC] border border-[#F1B7B0] text-[#C0392B] px-3 py-2 flex items-center gap-2">
                  <span className="text-[12px] font-medium flex-1">
                    {error.message}
                  </span>
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    aria-label="Dismiss"
                    className="w-5 h-5 rounded-full bg-[#C0392B] text-white flex items-center justify-center hover:bg-[#A82E20] shrink-0"
                  >
                    <IconClose size={12} />
                  </button>
                </div>
              )}
            </section>

            </div>{/* end of dimmable top sections */}

            {/* Auto teach all toggle / active header */}
            <section className="pt-4 border-t border-ink-line">
              {autoTeachEditorOpen ? (
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoTeachAll(false);
                      setAutoTeachEditorOpen(false);
                    }}
                    className="flex items-center gap-2.5"
                  >
                    <ToggleSwitchPill on={true} />
                    <span className="font-mulish text-[12px] text-ink font-bold">
                      Auto teach all bites
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAutoTeachEditorOpen(false)}
                    className="text-[12px] text-brand-700 font-semibold hover:underline"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="w-full rounded-lg border border-ink-line px-3.5 py-2.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      // Toggle only — does NOT open the editor
                      setAutoTeachAll((v) => !v);
                    }}
                    className="flex items-center gap-3 flex-1 text-left"
                  >
                    <ToggleSwitchPill on={autoTeachAll} />
                    <span className="font-mulish text-[10px] text-ink font-semibold">
                      Auto teach all bites
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Default / pencil — opens the editor
                      setAutoTeachAll(true);
                      setAutoTeachEditorOpen(true);
                      setShowAllBites(true);
                    }}
                    className="flex items-center gap-1.5 text-[12px] text-brand-700 font-semibold hover:underline"
                  >
                    Default
                    <IconEdit size={13} />
                  </button>
                </div>
              )}
            </section>

            {/* Auto-teach-all expanded panel */}
            {autoTeachEditorOpen && (
              <section className="space-y-3">
                {/* 22-tile grid */}
                <div className="grid grid-cols-7 gap-x-2 gap-y-2">
                  {biteTiles
                    .filter((t) => !slotted.has(t.number))
                    .map((t) => {
                      const state = tileState(t.number);
                      const isFinalized =
                        INITIAL_TILE_STATES[t.number] === "finalized";
                      return (
                        <BiteTile
                          key={`atall-${t.number}`}
                          number={t.number}
                          state={state}
                          size="sm"
                          hasDescription={biteHasAnyDescription(t.number)}
                          onClick={() => toggleTile(t.number)}
                          draggable
                          onDragStart={(e) => {
                            if (isFinalized) {
                              e.preventDefault();
                              showBitesError(
                                `Bite ${t.number} is finalized, to teach it again change status to draft`,
                              );
                              return;
                            }
                            setDraggedTile(t.number);
                            e.dataTransfer.effectAllowed = "move";
                            e.dataTransfer.setData(
                              "text/plain",
                              String(t.number),
                            );
                          }}
                          onDragEnd={() => {
                            setDraggedTile(null);
                            setOverSlot(null);
                          }}
                        />
                      );
                    })}
                </div>

                {/* Progress hint */}
                <div className="text-[11px] text-ink-mute">
                  Drop all {assignableCount} bites into the teaching styles to
                  enable Auto-Teach.{" "}
                  <span
                    className={`font-semibold ${
                      allBitesPlaced ? "text-brand-700" : "text-ink-soft"
                    }`}
                  >
                    {totalAssigned}/{assignableCount} placed
                  </span>
                </div>

                {/* 4 slot frames (same data as top, but interactive in this mode) */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  {(Object.keys(STYLE_LABELS) as StyleId[]).map((id, idx) => (
                    <Fragment key={`atall-${id}`}>
                      <SlotCard
                        id={id}
                        label={STYLE_LABELS[id]}
                        items={slots[id]}
                        isOver={overSlot === id}
                        checkIn={checkIns[id]}
                        onToggleCheckIn={() => {
                          if (slots[id].length === 0) {
                            showSlotsError(
                              `Drop in bites to enable Check-in's for ${STYLE_LABELS[id]}`,
                            );
                            return;
                          }
                          setError(null);
                          setCheckIns((p) => ({ ...p, [id]: !p[id] }));
                        }}
                        onMenuAction={(action) => {
                          if (slots[id].length === 0) {
                            showSlotsError(
                              `Drop in bites to ${action.toLowerCase()} for ${STYLE_LABELS[id]}`,
                            );
                            return;
                          }
                          setError(null);
                          setDescriptionEditor({
                            slot: id,
                            kind:
                              action === "Add Bite Description"
                                ? "bite"
                                : "instructions",
                          });
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "move";
                          setOverSlot(id);
                        }}
                        onDragLeave={() => {
                          if (overSlot === id) setOverSlot(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const raw = e.dataTransfer.getData("text/plain");
                          const n =
                            draggedTile ?? (raw ? Number(raw) : NaN);
                          if (
                            Number.isFinite(n) &&
                            n > 0 &&
                            INITIAL_TILE_STATES[n] !== "finalized"
                          ) {
                            dropOnSlot(id, n);
                          }
                          setOverSlot(null);
                          setDraggedTile(null);
                        }}
                        onRemove={(n) => removeFromSlot(id, n)}
                        biteHasAnyDescription={biteHasAnyDescription}
                        onRequestRemovePopover={(n, rect) =>
                          setRemovePopover({
                            slot: id,
                            n,
                            top: rect.bottom + 6,
                            left: rect.left,
                          })
                        }
                        onTileDragStart={(n, e) => {
                          setDraggedTile(n);
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", String(n));
                          e.dataTransfer.setData(
                            "application/x-from-slot",
                            id,
                          );
                        }}
                        onTileDragEnd={(n, e) => {
                          if (e.dataTransfer.dropEffect === "none") {
                            removeFromSlot(id, n);
                          }
                          setDraggedTile(null);
                          setOverSlot(null);
                        }}
                      />
                      {idx % 2 === 1 && (
                        <>
                          {(() => {
                            const prev = (Object.keys(STYLE_LABELS) as StyleId[])[
                              idx - 1
                            ];
                            const aBite = savedBiteTargetsFor(prev);
                            const aInstr = savedInstructionTargetsFor(prev);
                            const bBite = savedBiteTargetsFor(id);
                            const bInstr = savedInstructionTargetsFor(id);
                            if (
                              aBite.length === 0 &&
                              aInstr.length === 0 &&
                              bBite.length === 0 &&
                              bInstr.length === 0
                            )
                              return null;
                            return (
                              <>
                                <SavedDescriptionsCell
                                  biteTargets={aBite}
                                  instructionTargets={aInstr}
                                  onOpenBite={() =>
                                    setDescriptionEditor({
                                      slot: prev,
                                      kind: "bite",
                                    })
                                  }
                                  onOpenInstruction={() =>
                                    setDescriptionEditor({
                                      slot: prev,
                                      kind: "instructions",
                                    })
                                  }
                                />
                                <SavedDescriptionsCell
                                  biteTargets={bBite}
                                  instructionTargets={bInstr}
                                  onOpenBite={() =>
                                    setDescriptionEditor({
                                      slot: id,
                                      kind: "bite",
                                    })
                                  }
                                  onOpenInstruction={() =>
                                    setDescriptionEditor({
                                      slot: id,
                                      kind: "instructions",
                                    })
                                  }
                                />
                              </>
                            );
                          })()}
                        </>
                      )}
                      {idx % 2 === 1 &&
                        descriptionEditor &&
                        [
                          (Object.keys(STYLE_LABELS) as StyleId[])[idx - 1],
                          id,
                        ].includes(descriptionEditor.slot) && (
                          <DescriptionPanel
                            slotId={descriptionEditor.slot}
                            slotLabel={STYLE_LABELS[descriptionEditor.slot]}
                            kind={descriptionEditor.kind}
                            bites={slots[descriptionEditor.slot]}
                            descriptions={
                              descriptionEditor.kind === "instructions"
                                ? specificInstructions
                                : biteDescriptions
                            }
                            onSave={(target, text) => {
                              const slot = descriptionEditor.slot;
                              const setter =
                                descriptionEditor.kind === "instructions"
                                  ? setSpecificInstructions
                                  : setBiteDescriptions;
                              setter((prev) => {
                                const next = { ...prev };
                                if (target === "all") {
                                  slots[slot].forEach((n) => {
                                    next[`${slot}:${n}`] = text;
                                  });
                                } else {
                                  next[`${slot}:${target}`] = text;
                                }
                                return next;
                              });
                            }}
                            onDelete={(target) => {
                              const slot = descriptionEditor.slot;
                              const setter =
                                descriptionEditor.kind === "instructions"
                                  ? setSpecificInstructions
                                  : setBiteDescriptions;
                              setter((prev) => {
                                const next = { ...prev };
                                if (target === "all") {
                                  slots[slot].forEach((n) => {
                                    delete next[`${slot}:${n}`];
                                  });
                                } else {
                                  delete next[`${slot}:${target}`];
                                }
                                return next;
                              });
                            }}
                            onClose={() => setDescriptionEditor(null)}
                          />
                        )}
                    </Fragment>
                  ))}
                </div>
              </section>
            )}

            {/* Finalized / Draft */}
            <section className="pt-4 border-t border-ink-line">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[12.5px] text-ink-soft leading-snug">
                  All Auto-Taught lessons should be
                </div>
                <div className="flex bg-surface-alt rounded-md p-0.5 border border-ink-line shrink-0">
                  <button
                    type="button"
                    onClick={() => setFinalizeMode("finalized")}
                    className={`px-3 py-1 text-[12px] font-semibold rounded ${
                      finalizeMode === "finalized"
                        ? "bg-brand text-white"
                        : "text-ink-soft"
                    }`}
                  >
                    Finalized
                  </button>
                  <button
                    type="button"
                    onClick={() => setFinalizeMode("draft")}
                    className={`px-3 py-1 text-[12px] font-semibold rounded ${
                      finalizeMode === "draft"
                        ? "bg-brand text-white"
                        : "text-ink-soft"
                    }`}
                  >
                    Draft
                  </button>
                </div>
              </div>
            </section>


          {/* CTA */}
          <div className="px-4 pt-2 pb-4">
            <button
              type="button"
              onClick={() => {
                if (ctaEnabled) {
                  startAutoTeach();
                  return;
                }
                // Surface a helpful error toast instead of being inert
                if (autoTeachAll) {
                  if (!autoTeachEditorOpen) {
                    showSlotsError(
                      "Open the editor and drop all bites into the teaching styles first.",
                    );
                  } else {
                    const remaining = assignableCount - totalAssigned;
                    showSlotsError(
                      `Drop ${remaining} more bite${remaining === 1 ? "" : "s"} into the teaching styles to enable Auto-Teach.`,
                    );
                  }
                } else if (selected.size > 0 && totalAssigned === 0) {
                  showSlotsError(
                    "Drag the bites into one of the teaching styles to enable Auto-Teach.",
                  );
                } else {
                  showBitesError(
                    "Select bites and drop them into a teaching style to enable Auto-Teach.",
                  );
                }
              }}
              className={`w-full h-[48px] rounded-xl font-mulish text-[14px] font-bold transition-colors ${
                ctaEnabled
                  ? "bg-brand text-white hover:bg-brand-600 cursor-pointer"
                  : "bg-[#C4E5D2] text-white cursor-pointer hover:bg-[#B7DDC8]"
              }`}
            >
              {phase === "running" ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  Auto teach in progress
                </span>
              ) : autoTeachAll ? (
                "Auto-Teach all Bites"
              ) : totalAssigned > 0 ? (
                `Auto Teach ${totalAssigned} bite${totalAssigned > 1 ? "s" : ""}`
              ) : selected.size > 0 ? (
                "Auto-Teach selected bites"
              ) : (
                "Auto Teach"
              )}
            </button>
          </div>
          </div>{/* end of scrollable body */}
        </aside>
      )}

      {/* Modals */}
      {showLeaveModal && (
        <Modal
          title="Leave Auto Teach?"
          primaryLabel="Leave anyway"
          secondaryLabel="Keep teaching"
          tone="warning"
        >
          <div onClick={() => setShowLeaveModal(false)}>
            Auto Teach is still running. If you leave, the remaining bites
            won&apos;t be generated.
          </div>
        </Modal>
      )}
      {showFinalModal && (
        <Modal
          title="Mark all taught slides as Final?"
          primaryLabel="Mark as Final"
          secondaryLabel="Cancel"
        >
          <div onClick={() => setShowFinalModal(false)}>
            {totalToRun} bite{totalToRun > 1 ? "s" : ""} will be moved from
            Draft to Final. You can still edit them after.
          </div>
        </Modal>
      )}
      {showNotTaughtModal && (
        <Modal
          title="Some bites weren’t fully taught"
          primaryLabel="Re-run for those bites"
          secondaryLabel="Dismiss"
        >
          <div onClick={() => setShowNotTaughtModal(false)}>
            We couldn&apos;t generate teaching for all of your selected bites.
            You can re-run Auto Teach to fill the gaps.
          </div>
        </Modal>
      )}
      {showInstructionsSheet && (
        <InstructionsSheetModal onClose={() => setShowInstructionsSheet(false)} />
      )}
      {removePopover &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-[60] cursor-default"
              onClick={() => setRemovePopover(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setRemovePopover(null);
              }}
            />
            <div
              className="fixed z-[70] rounded-lg bg-ink shadow-pop py-1.5 px-0 text-white"
              style={{
                top: removePopover.top,
                left: removePopover.left,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  removeFromSlot(removePopover.slot, removePopover.n);
                  setRemovePopover(null);
                }}
                className="block w-full text-left px-4 py-1.5 font-mulish text-[13px] font-semibold whitespace-nowrap hover:bg-white/10"
              >
                Remove Bite {removePopover.n}
              </button>
            </div>
          </>,
          document.body,
        )}
    </AppShell>
  );
}

function SlotCard({
  id,
  label,
  items,
  isOver,
  checkIn,
  onToggleCheckIn,
  onMenuAction,
  onDragOver,
  onDragLeave,
  onDrop,
  onRemove,
  onRequestRemovePopover,
  onTileDragStart,
  onTileDragEnd,
  savedDescriptions,
  onOpenSavedDescription,
  biteHasAnyDescription,
}: {
  id: StyleId;
  label: string;
  items: number[];
  isOver: boolean;
  checkIn: boolean;
  onToggleCheckIn: () => void;
  onMenuAction: (action: "Add Bite Description" | "Add Specific Instructions") => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onRemove: (n: number) => void;
  onRequestRemovePopover: (n: number, anchor: DOMRect) => void;
  onTileDragStart: (n: number, e: React.DragEvent) => void;
  onTileDragEnd: (n: number, e: React.DragEvent) => void;
  /** Bite numbers (or "all") with saved descriptions for this slot. Shows the chips row below. */
  savedDescriptions?: (number | "all")[];
  /** Clicking a saved-descriptions chip opens the editor on that target. */
  onOpenSavedDescription?: (target: number | "all") => void;
  /** Returns whether bite N has any saved description or instruction across slots. */
  biteHasAnyDescription?: (n: number) => boolean;
}) {
  const hasItems = items.length > 0;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const savedTargets = savedDescriptions ?? [];
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    if (!menuOpen) {
      setMenuPos(null);
      return;
    }
    const el = menuTriggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setMenuPos({
      top: rect.bottom + 4,
      right: window.innerWidth - rect.right,
    });
  }, [menuOpen]);
  return (
    <div className="flex flex-col h-full">
      {/* Drop frame — only the dashed/solid border + label/tiles inside */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-slot={id}
        className={`flex-1 rounded-xl flex items-center justify-center min-h-[72px] px-3 py-3 transition-colors ${
          isOver
            ? "border-2 border-brand bg-brand-50/60"
            : hasItems
              ? "border-2 border-brand bg-brand-50/30 border-dashed"
              : "border-2 border-dashed border-brand/40"
        }`}
      >
        {hasItems ? (
          <div className="flex flex-col items-center gap-1.5 w-full">
            <span className="font-mulish text-[12px] font-bold text-ink">
              {label}
            </span>
            <div className="flex flex-wrap gap-1 justify-center">
              {items.map((n) => {
                const initState = INITIAL_TILE_STATES[n];
                const stripe =
                  initState === "available" ||
                  initState === "available-selected"
                    ? "bg-[#F4B33E]"
                    : initState === "finalized"
                      ? "bg-white/70"
                      : null;
                return (
                  <button
                    key={n}
                    type="button"
                    draggable
                    onDragStart={(e) => onTileDragStart(n, e)}
                    onDragEnd={(e) => onTileDragEnd(n, e)}
                    onClick={(e) => {
                      const rect = (
                        e.currentTarget as HTMLElement
                      ).getBoundingClientRect();
                      onRequestRemovePopover(n, rect);
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      const rect = (
                        e.currentTarget as HTMLElement
                      ).getBoundingClientRect();
                      onRequestRemovePopover(n, rect);
                    }}
                    title="Click, right-click, or drag out to remove"
                    className="relative w-[36px] h-[28px] rounded-md overflow-hidden bg-brand text-white text-[13px] font-bold flex items-center justify-center shadow-[0_1px_2px_rgba(16,24,40,0.05)] hover:bg-brand-600 cursor-grab active:cursor-grabbing"
                  >
                    {stripe && (
                      <span
                        className={`absolute top-0 left-0 right-0 h-1 ${stripe}`}
                      />
                    )}
                    <span className="absolute inset-0 flex items-center justify-center">
                      {n}
                    </span>
                    {biteHasAnyDescription?.(n) && (
                      <span
                        className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#2E72E8] ring-1 ring-white"
                        aria-label="has description"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <span className="font-mulish text-[12px] font-bold text-ink">
            {label}
          </span>
        )}
      </div>

      {/* Footer row — OUTSIDE the frame */}
      <div className="flex items-center justify-between mt-2 px-1">
        <button
          type="button"
          onClick={onToggleCheckIn}
          className="flex items-center gap-2 group"
        >
          <span className="text-[11px] text-ink-soft font-medium">
            Check-in&apos;s
          </span>
          <ToggleSwitch on={checkIn} />
        </button>
        <div>
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={`${label} options`}
            onClick={() => setMenuOpen((v) => !v)}
            className="text-brand hover:text-brand-600 leading-none px-1 py-1 rounded"
          >
            <svg width="16" height="4" viewBox="0 0 16 4" fill="currentColor">
              <circle cx="2" cy="2" r="1.6" />
              <circle cx="8" cy="2" r="1.6" />
              <circle cx="14" cy="2" r="1.6" />
            </svg>
          </button>
          {menuOpen &&
            menuPos &&
            typeof document !== "undefined" &&
            createPortal(
              <>
                {/* click-outside catcher */}
                <button
                  type="button"
                  aria-hidden
                  tabIndex={-1}
                  className="fixed inset-0 z-[60] cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="fixed z-[70] whitespace-nowrap rounded-lg bg-ink shadow-pop py-1 text-white"
                  style={{ top: menuPos.top, right: menuPos.right }}
                >
                  {(
                    [
                      "Add Bite Description",
                      "Add Specific Instructions",
                    ] as const
                  ).map((action) => (
                    <button
                      key={action}
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        onMenuAction(action);
                      }}
                      className="block w-full text-left px-4 py-2 font-mulish text-[12px] font-semibold hover:bg-white/10 whitespace-nowrap"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </>,
              document.body,
            )}
        </div>
      </div>

    </div>
  );
}

function SavedDescriptionsCell({
  biteTargets,
  instructionTargets,
  onOpenBite,
  onOpenInstruction,
}: {
  biteTargets: (number | "all")[];
  instructionTargets: (number | "all")[];
  onOpenBite: (target: number | "all") => void;
  onOpenInstruction: (target: number | "all") => void;
}) {
  if (biteTargets.length === 0 && instructionTargets.length === 0) {
    return <div />;
  }
  return (
    <div className="px-1 -mt-1 space-y-2.5">
      {biteTargets.length > 0 && (
        <SavedRow
          label="Bite descriptions available for"
          targets={biteTargets}
          onOpen={onOpenBite}
        />
      )}
      {instructionTargets.length > 0 && (
        <SavedRow
          label="Specific Instructions available for"
          targets={instructionTargets}
          onOpen={onOpenInstruction}
        />
      )}
    </div>
  );
}

function SavedRow({
  label,
  targets,
  onOpen,
}: {
  label: string;
  targets: (number | "all")[];
  onOpen: (target: number | "all") => void;
}) {
  return (
    <div>
      <div className="font-mulish text-[10px] text-ink-mute font-semibold mb-1.5">
        {label}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {targets.map((t) => (
          <button
            key={String(t)}
            type="button"
            onClick={() => onOpen(t)}
            className="h-[24px] px-2 rounded-md bg-brand-50 text-brand-700 text-[11px] font-semibold border border-brand/30 hover:bg-brand-100"
          >
            {t === "all" ? "All" : t}
          </button>
        ))}
      </div>
    </div>
  );
}

function DescriptionPanel({
  slotId,
  slotLabel,
  kind,
  bites,
  descriptions,
  onSave,
  onDelete,
  onClose,
}: {
  slotId: StyleId;
  slotLabel: string;
  kind: "bite" | "instructions";
  bites: number[];
  descriptions: Record<string, string>;
  onSave: (target: number | "all", text: string) => void;
  onDelete: (target: number | "all") => void;
  onClose: () => void;
}) {
  // "All Bites" is considered saved only when EVERY bite currently in the slot has the
  // same non-empty description. Adding a new bite without a description collapses this
  // back to per-bite chips automatically.
  const perBiteValues = bites.map(
    (n) => descriptions[`${slotId}:${n}`] || "",
  );
  const allSaved =
    bites.length > 0 &&
    perBiteValues.every(
      (v) => v.trim().length > 0 && v === perBiteValues[0],
    );
  const sharedAllText = allSaved ? perBiteValues[0] : "";

  const savedBiteTargets = allSaved
    ? []
    : bites.filter(
        (n) => (descriptions[`${slotId}:${n}`] || "").trim().length > 0,
      );

  const [target, setTarget] = useState<number | "all">("all");
  const [text, setText] = useState(sharedAllText);
  const [deletePopover, setDeletePopover] = useState<
    { target: number | "all"; top: number; left: number } | null
  >(null);

  // When target changes, swap the textarea contents to the saved description for it.
  useLayoutEffect(() => {
    if (target === "all") {
      setText(sharedAllText);
    } else {
      setText(descriptions[`${slotId}:${target}`] || "");
    }
  }, [target, slotId, descriptions, sharedAllText]);

  const headline =
    kind === "instructions"
      ? `Add specific instructions for ${slotLabel.toLowerCase()} style`
      : `Add Bite descriptions for ${slotLabel.toLowerCase()} style`;

  const targetLabel = target === "all" ? "For all Bites" : `For Bite ${target}`;
  const placeholder =
    target === "all"
      ? `Add description for all bites`
      : `Add description for Bite ${target}`;

  return (
    <div className="col-span-2 rounded-xl border border-brand bg-brand-50/20 p-3.5">
      <div className="font-mulish text-[12px] font-bold text-ink mb-3">
        {headline}
      </div>

      {/* Bite chip selector + For all Bites — tight, chips and CTA side-by-side */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="flex items-center gap-1 flex-wrap">
          {bites.map((n) => {
            const isActive = target === n;
            const blocked = allSaved && target !== n;
            return (
              <button
                key={n}
                type="button"
                onClick={() => {
                  if (blocked) return;
                  setTarget(n);
                }}
                disabled={blocked}
                title={
                  blocked
                    ? "Remove the 'All Bites' description first to set a per-bite description"
                    : undefined
                }
                className={`w-[34px] h-[26px] rounded-md font-mulish text-[11px] font-bold transition-opacity ${
                  isActive
                    ? "bg-brand text-white"
                    : blocked
                      ? "bg-[#F2F2F2] text-ink/40 cursor-not-allowed opacity-60"
                      : "bg-[#F2F2F2] text-ink hover:brightness-95"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setTarget("all")}
          className={`h-[26px] px-2.5 rounded-md font-mulish text-[11px] font-semibold whitespace-nowrap ${
            target === "all"
              ? "bg-brand text-white ring-1 ring-brand"
              : "bg-white border border-brand/40 text-brand-700"
          }`}
        >
          For all Bites
        </button>
      </div>

      {/* Target label + textarea */}
      <div className="font-mulish text-[11px] text-ink-soft font-semibold mb-1.5">
        {targetLabel}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-md bg-[#F2F2F2] border border-ink-line p-3 text-[12px] text-ink resize-none focus:outline-none focus:border-brand"
      />

      {(savedBiteTargets.length > 0 || allSaved) && (
        <div className="mt-3">
          <div className="font-mulish text-[10px] text-ink-mute font-semibold mb-1.5">
            Available descriptions
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allSaved && (
              <button
                type="button"
                onClick={(e) => {
                  const r = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  setDeletePopover({
                    target: "all",
                    top: r.bottom + 6,
                    left: r.left,
                  });
                }}
                className="px-2.5 h-[26px] rounded-md text-[11px] font-medium border border-ink-line text-ink-soft bg-white hover:border-brand/50"
              >
                All Bites
              </button>
            )}
            {savedBiteTargets.map((n) => (
              <button
                key={n}
                type="button"
                onClick={(e) => {
                  const r = (
                    e.currentTarget as HTMLElement
                  ).getBoundingClientRect();
                  setDeletePopover({
                    target: n,
                    top: r.bottom + 6,
                    left: r.left,
                  });
                }}
                className="px-2.5 h-[26px] rounded-md text-[11px] font-medium border border-ink-line text-ink-soft bg-white hover:border-brand/50"
              >
                Bite {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Red delete popover — rendered via portal so it escapes the editor's overflow */}
      {deletePopover &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-hidden
              tabIndex={-1}
              className="fixed inset-0 z-[60] cursor-default"
              onClick={() => setDeletePopover(null)}
            />
            <div
              className="fixed z-[70] rounded-lg bg-[#C0392B] shadow-pop py-1 text-white"
              style={{
                top: deletePopover.top,
                left: Math.max(8, deletePopover.left),
              }}
            >
              <button
                type="button"
                onClick={() => {
                  onDelete(deletePopover.target);
                  setDeletePopover(null);
                }}
                className="block w-full text-left px-3.5 py-1.5 font-mulish text-[12px] font-semibold hover:bg-white/10 whitespace-nowrap"
              >
                Delete{" "}
                {kind === "instructions"
                  ? "Specific Instruction"
                  : "Slide Description"}
              </button>
            </div>
          </>,
          document.body,
        )}

      <button
        type="button"
        onClick={() => onSave(target, text)}
        className="w-full h-[40px] mt-3 rounded-lg bg-brand text-white font-mulish text-[13px] font-bold hover:bg-brand-600"
      >
        Save Description
      </button>
      <button
        type="button"
        onClick={onClose}
        className="block mx-auto mt-2 text-[12px] text-brand-700 font-semibold hover:underline"
      >
        Close
      </button>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  const bg =
    color === "var(--brand)" ? undefined : { backgroundColor: color };
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block w-3 h-3 rounded-full ${
          color === "var(--brand)" ? "bg-brand" : ""
        }`}
        style={bg}
      />
      <span className="font-mulish text-[10px] text-ink-mute">{label}</span>
    </div>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-block w-[30px] h-[16px] rounded-full relative transition-colors ${
        on ? "bg-brand" : "bg-ink-line"
      }`}
    >
      <span
        className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${
          on ? "left-[15px]" : "left-0.5"
        }`}
      />
    </span>
  );
}

function ToggleSwitchPill({ on }: { on: boolean }) {
  return (
    <span
      className={`inline-block w-[34px] h-[18px] rounded-full relative transition-colors ${
        on ? "bg-brand" : "bg-ink-line"
      }`}
    >
      <span
        className={`absolute top-0.5 w-[14px] h-[14px] rounded-full bg-white shadow transition-all ${
          on ? "left-[17px]" : "left-0.5"
        }`}
      />
    </span>
  );
}

