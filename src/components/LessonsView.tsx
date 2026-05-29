import BiteCard, { type TaughtVariant } from "./BiteCard";
import { bites as defaultBites, TOTAL_BITES, type Bite } from "@/data/bites";

type Props = {
  heading?: string | null;
  bites?: Bite[];
  collapsedAll?: boolean;
  selectedIds?: string[];
  /** When true, every BiteCard's Teach button is rendered disabled. */
  allTeachDisabled?: boolean;
  /** Per-bite post-teach overrides, keyed by bite id. */
  taughtVariants?: Record<string, TaughtVariant>;
};

export default function LessonsView({
  heading = null,
  bites = defaultBites,
  collapsedAll = false,
  selectedIds = [],
  allTeachDisabled = false,
  taughtVariants,
}: Props) {
  return (
    <div className="max-w-[1080px] mx-auto pb-32 pt-4">
      {heading && (
        <h1 className="text-[18px] font-semibold text-ink mb-5">{heading}</h1>
      )}
      {bites.map((b) => (
        <BiteCard
          key={b.id}
          index={b.index}
          total={TOTAL_BITES}
          title={b.title}
          status={b.status}
          taughtChip={b.taughtChip}
          collapsed={collapsedAll || b.index > 2}
          selected={selectedIds.includes(b.id)}
          teachDisabled={allTeachDisabled}
          taughtVariant={taughtVariants?.[b.id]}
        />
      ))}
    </div>
  );
}
