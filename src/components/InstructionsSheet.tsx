import { IconClose, IconInfo } from "./icons";

export default function InstructionsSheet() {
  return (
    <aside className="fixed right-[400px] top-[92px] bottom-6 w-[360px] z-30 bg-white rounded-2xl ring-1 ring-ink-line shadow-pop flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-ink-line">
        <div className="flex items-center gap-2">
          <IconInfo size={16} className="text-brand-600" />
          <h3 className="text-[14px] font-semibold text-ink">Instructions</h3>
        </div>
        <button
          className="text-ink-mute hover:text-ink"
          aria-label="Close"
          type="button"
        >
          <IconClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 text-[13px] text-ink-soft leading-relaxed space-y-3">
        <p>
          <strong className="text-ink">Auto Teach</strong> turns selected bites
          into a full taught flow. For each bite, the system writes:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-ink-soft">
          <li>Narration for every slide</li>
          <li>On-canvas instructions and call-outs</li>
          <li>Per-slide speaker notes</li>
        </ul>
        <p>
          Before running, ensure each bite has at least one slide and a clear
          title. You can adjust slide descriptions afterwards.
        </p>
        <h4 className="text-[12px] uppercase tracking-wider font-semibold text-ink-mute mt-4">
          Tips
        </h4>
        <ul className="list-disc pl-5 space-y-1">
          <li>Add bite descriptions to give the model more context.</li>
          <li>Mark slides as <em>Final</em> once you&apos;ve reviewed.</li>
          <li>You can re-run Auto Teach on a single bite at any time.</li>
        </ul>
      </div>
    </aside>
  );
}
