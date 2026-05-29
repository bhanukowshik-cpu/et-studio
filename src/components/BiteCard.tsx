"use client";

import { useState } from "react";
import {
  IconEdit,
  IconChevronDown,
  IconChevronUp,
  IconFile,
  IconSettings,
  IconCopy,
  IconTrash,
  IconExternal,
} from "./icons";

export type BiteStatus = "draft" | "teach" | "auto-teaching" | "teaching-done";
export type TaughtVariant = "finalized" | "draft";

type Props = {
  index: number;
  total: number;
  title: string;
  status?: BiteStatus;
  selected?: boolean;
  taughtChip?: boolean;
  collapsed?: boolean;
  children?: React.ReactNode;
  /** When Auto Teach is running, the Teach button is greyed out. */
  teachDisabled?: boolean;
  /** Post-teach state. When set, replaces Preview/Teach with EverTutor + Edit/Finalize,
   * surfaces the kabab menu for the draft variant, and shows the "Auto-taught with AI" chip. */
  taughtVariant?: TaughtVariant;
};

const statusChip: Record<BiteStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-[#FEF1C7] text-[#A56700]" },
  teach: { label: "Teach", cls: "bg-brand-50 text-brand-700" },
  "auto-teaching": {
    label: "Auto Teaching..",
    cls: "bg-[#E7F0FF] text-[#1F5BB0]",
  },
  "teaching-done": {
    label: "Teaching done",
    cls: "bg-[#DFF5EA] text-brand-700",
  },
};

const taughtChipFor: Record<TaughtVariant, { label: string; cls: string }> = {
  finalized: { label: "Finalized", cls: "bg-[#DFF5EA] text-brand-700" },
  draft: { label: "Draft", cls: "bg-[#FEF1C7] text-[#A56700]" },
};

export default function BiteCard({
  index,
  total,
  title,
  status = "draft",
  selected = false,
  taughtChip = false,
  collapsed = false,
  children,
  teachDisabled = false,
  taughtVariant,
}: Props) {
  const chip = taughtVariant ? taughtChipFor[taughtVariant] : statusChip[status];
  const idx = String(index).padStart(2, "0");
  const tot = String(total).padStart(2, "0");
  const [kababOpen, setKababOpen] = useState(false);
  const isTaught = !!taughtVariant;

  return (
    <section
      className={`relative bg-white rounded-2xl ${
        selected
          ? "ring-2 ring-brand shadow-pop"
          : "ring-1 ring-ink-line shadow-card"
      } mb-6`}
    >
      <div className="flex items-center gap-3 px-5 py-3">
        <h3 className="text-[13px] font-medium text-ink truncate max-w-[260px] shrink-0">
          <span className="text-ink-soft">
            Bites {idx} / {tot} -
          </span>{" "}
          <span className="underline decoration-ink-line underline-offset-2">
            {title}
          </span>
        </h3>
        <button type="button" className="text-ink-mute hover:text-ink">
          <IconEdit size={14} />
        </button>
        <span
          className={`ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${chip.cls}`}
        >
          {chip.label}
          {!isTaught && <IconChevronDown size={11} />}
          {isTaught && taughtVariant === "draft" && (
            <IconChevronDown size={11} />
          )}
        </span>

        {taughtChip && !isTaught && (
          <span className="ml-1 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium bg-[#E8F8F0] text-brand-700">
            ✓ Taught
          </span>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-ink-mute">
          <IconBtn label="Move up">
            <IconChevronUp size={16} />
          </IconBtn>
          <IconBtn label="Move down">
            <IconChevronDown size={16} />
          </IconBtn>
          <IconBtn label="Open">
            <IconFile size={15} />
          </IconBtn>
          <IconBtn label="Settings">
            <IconSettings size={15} />
          </IconBtn>
          <IconBtn label="Duplicate">
            <IconCopy size={15} />
          </IconBtn>
          <IconBtn label="Delete">
            <IconTrash size={15} />
          </IconBtn>

          {/* Kabab menu — only for taught-draft state */}
          {isTaught && taughtVariant === "draft" && (
            <div className="relative">
              <button
                type="button"
                aria-label="More options"
                onClick={() => setKababOpen((v) => !v)}
                className="p-1.5 rounded hover:bg-ink-line/40 hover:text-ink-soft"
              >
                <KababIcon />
              </button>
              {kababOpen && (
                <>
                  <button
                    type="button"
                    aria-hidden
                    tabIndex={-1}
                    className="fixed inset-0 z-30 cursor-default"
                    onClick={() => setKababOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 z-40 min-w-[170px] rounded-lg bg-white ring-1 ring-ink-line shadow-pop py-1.5">
                    <button
                      type="button"
                      onClick={() => setKababOpen(false)}
                      className="block w-full text-left px-3.5 py-1.5 text-[12px] text-ink-soft hover:bg-ink-line/30"
                    >
                      Slide Instructions
                    </button>
                    <button
                      type="button"
                      onClick={() => setKababOpen(false)}
                      className="block w-full text-left px-3.5 py-1.5 text-[12px] text-ink-soft hover:bg-ink-line/30"
                    >
                      Redo Teaching
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action buttons — change based on state */}
          {isTaught ? (
            <>
              <button
                type="button"
                className="ml-2 h-[30px] px-3 rounded-md border border-ink-line text-ink-soft text-[12px] font-medium hover:bg-ink-line/30 flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                Preview EverTutor
                <IconExternal size={12} />
              </button>
              <button
                type="button"
                className="h-[30px] px-3 rounded-md bg-brand text-white text-[12px] font-semibold hover:bg-brand-600"
              >
                {taughtVariant === "finalized" ? "Edit" : "Finalize"}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="ml-2 h-[30px] px-3 rounded-md border border-ink-line text-ink-soft text-[12px] font-medium hover:bg-ink-line/30"
              >
                Preview
              </button>
              <button
                type="button"
                disabled={teachDisabled}
                className={`h-[30px] px-3 rounded-md text-[12px] font-semibold transition-colors ${
                  teachDisabled
                    ? "bg-[#C4E5D2] text-white cursor-not-allowed"
                    : "bg-brand text-white hover:bg-brand-600"
                }`}
              >
                Teach
              </button>
            </>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="border-t border-ink-line/70 px-5 py-6">
          {children ?? <BitePreviewPlaceholder />}
        </div>
      )}

      {/* "Auto-taught with AI" chip — anchored below the card */}
      {isTaught && (
        <div className="absolute -bottom-3 left-7 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white ring-1 ring-ink-line px-2.5 py-1 text-[11px] font-medium text-ink-soft shadow-card">
            <SparkleMini />
            Auto-taught with AI
          </span>
        </div>
      )}

      {/* Right-side splitter handle */}
      <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-[26px] h-[28px] rounded-md bg-brand text-white flex items-center justify-center shadow-card">
        <svg
          width="12"
          height="14"
          viewBox="0 0 12 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 5 6 2l3 3" />
          <path d="M3 9l3 3 3-3" />
        </svg>
      </div>
    </section>
  );
}

function IconBtn({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="p-1.5 rounded hover:bg-ink-line/40 hover:text-ink-soft"
    >
      {children}
    </button>
  );
}

function KababIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
      <circle cx="2" cy="2" r="1.6" />
      <circle cx="2" cy="8" r="1.6" />
      <circle cx="2" cy="14" r="1.6" />
    </svg>
  );
}

function SparkleMini() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
      <defs>
        <linearGradient id="taughtSparkle" x1="0" y1="0" x2="24" y2="24">
          <stop offset="0%" stopColor="#FFB142" />
          <stop offset="100%" stopColor="#F47B2C" />
        </linearGradient>
      </defs>
      <path
        d="M12 2.5C12.6 8 16 11.4 21.5 12C16 12.6 12.6 16 12 21.5C11.4 16 8 12.6 2.5 12C8 11.4 11.4 8 12 2.5Z"
        fill="url(#taughtSparkle)"
      />
    </svg>
  );
}

function BitePreviewPlaceholder() {
  return (
    <div className="min-h-[440px] grid place-items-center text-center font-serif text-ink">
      <div className="space-y-4 max-w-[640px]">
        <h2 className="text-[20px] font-semibold">
          Let&apos;s find{" "}
          <span className="underline decoration-[#F5A623] decoration-2 underline-offset-2">
            Derivatives
          </span>{" "}
          using chain rule
        </h2>
        <p className="text-sm">
          Find the derivative of{" "}
          <span className="inline-block align-middle font-serif text-base">
            <span className="text-lg">d</span>⁄
            <span className="text-lg">dx</span>
            <span className="text-[28px] align-middle">[</span>
            <span className="inline-block align-middle text-center">
              <span className="block border-b border-ink">2x − 3</span>
              <span className="block">4 + 5x</span>
            </span>
            <span className="text-[28px] align-middle">]</span>
            <sup className="text-xs">4</sup>
          </span>
        </p>

        <div className="grid grid-cols-2 gap-x-10 gap-y-3 mt-6 text-[13px]">
          <div className="space-y-3 text-left">
            <p>Let&apos;s simplify the derivative using the chain rule</p>
            <p className="font-mono">d/dx [f(x)]ⁿ = n·[f(x)]ⁿ⁻¹·f&apos;(x)</p>
            <p className="font-mono">4·[(2x−3)/(4+5x)]³ · f&apos;(x)</p>
            <p>f = 2x − 3   g = 4 + 5x</p>
            <p>f&apos; = 2     g&apos; = 5</p>
            <p>Formula for quotient rule is</p>
            <p className="font-mono">(g·f&apos; − f·g&apos;) / g²</p>
          </div>
          <div className="space-y-3 text-left font-mono">
            <p>(4 + 5x)(2) − (2x − 3)(5) ⁄ (4 + 5x)²</p>
            <p>(8 + 10x) − (10x − 15) ⁄ (4 + 5x)²</p>
            <p>4·[(2x−3)/(4+5x)]³ · (0 + 23)/(4+5x)²</p>
            <p>4·[(2x−3)³/(4+5x)³] · 23/(4+5x)²</p>
            <p>4·(2x−3)³·23 ⁄ (4+5x)⁵ = 92·(2x−3)³ ⁄ (4+5x)⁵</p>
          </div>
        </div>
      </div>
    </div>
  );
}
