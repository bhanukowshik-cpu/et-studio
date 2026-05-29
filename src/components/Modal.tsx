import { IconClose } from "./icons";

type Props = {
  title: string;
  children: React.ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  tone?: "default" | "warning";
};

export default function Modal({
  title,
  children,
  primaryLabel = "Confirm",
  secondaryLabel = "Cancel",
  tone = "default",
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative w-[440px] bg-white rounded-2xl shadow-pop overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-ink-line">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          <button
            type="button"
            className="text-ink-mute hover:text-ink"
            aria-label="Close"
          >
            <IconClose size={16} />
          </button>
        </div>
        <div className="px-5 py-5 text-[13px] text-ink-soft leading-relaxed">
          {children}
        </div>
        <div className="flex items-center justify-end gap-3 px-5 py-4 bg-surface-alt border-t border-ink-line">
          <button
            type="button"
            className="h-[36px] px-4 rounded-md border border-ink-line text-ink-soft text-[13px] font-medium hover:bg-white"
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            className={`h-[36px] px-4 rounded-md text-white text-[13px] font-semibold ${
              tone === "warning"
                ? "bg-accent-red hover:opacity-90"
                : "bg-brand hover:bg-brand-600"
            }`}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
