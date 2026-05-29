"use client";

import { IconClose, IconExternal } from "./icons";

type Style = {
  title: string;
  description: string;
  flow: string;
};

const styles: Style[] = [
  {
    title: "Default",
    description:
      "Balanced conversational teaching with explanations, guided questioning, and practice.",
    flow: "Explain → Ask guided questions → Practice → Recap",
  },
  {
    title: "Instruction",
    description:
      "Step-by-step concept teaching with stronger explanations and guided walkthroughs.",
    flow: "Explain → Example → Check Understanding",
  },
  {
    title: "Practice",
    description:
      "Guided and independent problem solving with less direct instruction.",
    flow: "Explain → Ask guided questions → Practice → Recap",
  },
  {
    title: "Review",
    description: "Fast-paced recap and fluency-focused questioning.",
    flow: "Recall → Quick Questions → Summary",
  },
];

export default function InstructionsSheetModal({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-pop w-full max-w-[760px] p-7"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mulish text-[20px] font-bold text-ink leading-none">
            Instructions Sheet
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-ink-mute hover:text-ink"
          >
            <IconClose size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {styles.map((s) => (
            <StyleCard key={s.title} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StyleCard({ title, description, flow }: Style) {
  return (
    <div className="rounded-xl border border-ink-line p-4 flex flex-col h-full">
      <h3 className="font-mulish text-[14px] font-bold text-ink mb-1.5">
        {title}
      </h3>
      <p className="text-[12px] text-ink-mute leading-relaxed">{description}</p>

      {/* Spacer pushes the flow box + button to the bottom of the card */}
      <div className="mt-auto pt-3">
        <div className="rounded-md bg-surface-alt border border-ink-line/70 px-3 py-2 text-[11.5px] text-ink-soft mb-3">
          {flow}
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-[30px] px-3 rounded-md border border-brand text-brand text-[11.5px] font-semibold hover:bg-brand-50"
        >
          View Sample Lesson
          <IconExternal size={11} />
        </button>
      </div>
    </div>
  );
}
