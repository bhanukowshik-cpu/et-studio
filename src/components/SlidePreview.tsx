import { IconChevronRight, IconArrowLeft, IconSparkle } from "./icons";

type Props = {
  variant?: "preview" | "finalize" | "instructions";
};

export default function SlidePreview({ variant = "preview" }: Props) {
  return (
    <div className="max-w-[1100px] mx-auto py-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          type="button"
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink"
        >
          <IconArrowLeft size={16} /> Back to lessons
        </button>
        <span className="text-ink-mute">/</span>
        <span className="text-[13px] text-ink">Bite 01 — Slide 03 of 12</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="h-[34px] px-3 rounded-md border border-ink-line text-[13px] font-medium hover:bg-white"
          >
            Mark as Draft
          </button>
          <button
            type="button"
            className="h-[34px] px-3 rounded-md bg-brand text-white text-[13px] font-semibold hover:bg-brand-600"
          >
            {variant === "finalize" ? "Mark as Final" : "Finalize slide"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-5">
        {/* Slide canvas */}
        <div className="bg-white rounded-2xl ring-1 ring-ink-line shadow-card aspect-[16/10] grid place-items-center">
          <div className="text-center max-w-[640px] px-10">
            <div className="text-[12px] uppercase tracking-wider text-brand-600 font-semibold mb-3">
              Slide 03
            </div>
            <h2 className="text-[26px] font-semibold text-ink font-serif">
              Let&apos;s find{" "}
              <span className="underline decoration-[#F5A623] decoration-2 underline-offset-2">
                Derivatives
              </span>{" "}
              using chain rule
            </h2>
            <p className="text-[14px] text-ink-mute mt-3">
              Find the derivative of{" "}
              <span className="font-mono">d/dx [(2x − 3)/(4 + 5x)]⁴</span>
            </p>
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-white rounded-2xl ring-1 ring-ink-line shadow-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[#22C2A8]"><IconSparkle size={16} /></span>
            <h3 className="text-[13px] font-semibold text-ink">
              {variant === "instructions" ? "Slide instructions" : "Narration"}
            </h3>
          </div>
          <p className="text-[12.5px] text-ink-soft leading-relaxed">
            Introduce the chain rule using the example shown. Emphasize the
            outer function&apos;s exponent first, then the quotient inside.
            Pause after writing the formula and ask students to identify the
            outer function.
          </p>

          <h4 className="text-[11px] uppercase tracking-wider font-semibold text-ink-mute mt-5 mb-2">
            Slides
          </h4>
          <ul className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className={`flex items-center gap-2 px-2 py-2 rounded-md text-[12px] ${
                  i === 2 ? "bg-brand-50 text-brand-700" : "text-ink-soft hover:bg-surface-alt"
                }`}
              >
                <span className="w-5 text-right text-ink-mute">{i + 1}</span>
                <span className="flex-1 truncate">
                  {i === 2 ? "Chain rule intro" : `Slide ${i + 1}`}
                </span>
                <IconChevronRight size={12} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
