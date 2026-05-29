type Props = {
  completed?: number;
  total?: number;
  /** Optional override message shown on the right side instead of "Teaching Bite N". */
  message?: string;
  currentBite?: number;
};

export default function ProgressBanner({
  completed = 0,
  total = 6,
  message,
  currentBite,
}: Props) {
  const pct =
    total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  const rightText =
    message ??
    (currentBite
      ? `Teaching Bite ${currentBite}`
      : completed < total
        ? `Teaching Bite ${Math.min(completed + 1, total)}`
        : "Done");

  return (
    <div className="sticky top-0 z-20 -mx-10 -mt-6 px-10 mb-5 bg-[#E5F3EA]">
      <div className="max-w-[1080px] mx-auto h-[44px] flex items-center justify-between text-brand-700">
        <span className="font-mulish text-[13px] font-semibold">
          Auto teach in Progress
        </span>
        <span className="font-mulish text-[13px] font-semibold">
          {rightText}
        </span>
      </div>
      {/* Full-width progress bar clipped to the very bottom of the banner */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-brand/15">
        <div
          className="h-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
