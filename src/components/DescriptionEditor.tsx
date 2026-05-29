import { IconClose, IconSparkle } from "./icons";

type Props = {
  mode: "bite" | "slide" | "both";
  saved?: boolean;
};

export default function DescriptionEditor({ mode, saved = false }: Props) {
  return (
    <aside className="fixed right-6 top-[92px] bottom-6 w-[400px] z-30 bg-white rounded-2xl ring-1 ring-ink-line shadow-pop flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-line">
        <div className="flex items-center gap-2">
          <span className="text-[#22C2A8]"><IconSparkle size={18} /></span>
          <h3 className="text-[14px] font-semibold text-ink">
            {mode === "bite" && "Bite description"}
            {mode === "slide" && "Slide description"}
            {mode === "both" && "Descriptions"}
          </h3>
        </div>
        <button className="text-ink-mute hover:text-ink" aria-label="Close" type="button">
          <IconClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {(mode === "bite" || mode === "both") && (
          <DescBlock
            label="Bite description"
            placeholder="What is this bite about? What should students walk away knowing?"
            value={
              saved || mode === "both"
                ? "Students learn to find the area of a rectangle using unit squares. Emphasize that area measures the space inside a shape."
                : ""
            }
            saved={saved || mode === "both"}
          />
        )}
        {(mode === "slide" || mode === "both") && (
          <DescBlock
            label="Slide description"
            placeholder="What happens on this specific slide?"
            value={
              saved || mode === "both"
                ? "Introduce the chain rule with a concrete example. Walk through each step slowly."
                : ""
            }
            saved={saved || mode === "both"}
          />
        )}

        {(mode === "slide" || mode === "both") && (
          <div>
            <label className="text-[12px] uppercase tracking-wider font-semibold text-ink-mute">
              Speaker notes
            </label>
            <textarea
              className="mt-2 w-full h-[120px] rounded-lg border border-ink-line p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
              placeholder="Optional notes for the AI narrator…"
              defaultValue={
                mode === "both"
                  ? "Pause briefly after introducing the formula."
                  : ""
              }
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-ink-line flex items-center gap-3">
        <button
          type="button"
          className="flex-1 h-[40px] rounded-lg border border-ink-line text-ink-soft text-[13px] font-medium hover:bg-surface-alt"
        >
          Cancel
        </button>
        <button
          type="button"
          className="flex-1 h-[40px] rounded-lg bg-brand text-white text-[13px] font-semibold hover:bg-brand-600"
        >
          {saved ? "Saved ✓" : "Save"}
        </button>
      </div>
    </aside>
  );
}

function DescBlock({
  label,
  placeholder,
  value,
  saved,
}: {
  label: string;
  placeholder: string;
  value: string;
  saved: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-[12px] uppercase tracking-wider font-semibold text-ink-mute">
          {label}
        </label>
        {saved && (
          <span className="text-[11px] text-brand-700 font-medium">Saved</span>
        )}
      </div>
      <textarea
        className="w-full h-[90px] rounded-lg border border-ink-line p-3 text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-brand/40"
        placeholder={placeholder}
        defaultValue={value}
      />
    </div>
  );
}
