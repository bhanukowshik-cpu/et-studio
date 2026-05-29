import Link from "next/link";
import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import LessonsView from "@/components/LessonsView";
import AutoTeachFab from "@/components/AutoTeachFab";
import AutoTeachSheet, { type StyleSlot } from "@/components/AutoTeachSheet";
import AutoTeachFlow from "@/components/AutoTeachFlow";
import InstructionsSheet from "@/components/InstructionsSheet";
import Modal from "@/components/Modal";
import DescriptionEditor from "@/components/DescriptionEditor";
import ProgressBanner from "@/components/ProgressBanner";
import SlidePreview from "@/components/SlidePreview";
import { bites, type Bite, type BiteTileState } from "@/data/bites";
import { getScreen, screens } from "@/data/screens";
import { IconArrowLeft } from "@/components/icons";

export function generateStaticParams() {
  return screens.map((s) => ({ slug: s.slug }));
}

export default async function ScreenPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const meta = getScreen(slug);
  if (!meta) notFound();

  return (
    <>
      <BreadCrumb slug={slug} title={meta.title} />
      {renderScreen(slug)}
    </>
  );
}

function BreadCrumb({ slug, title }: { slug: string; title: string }) {
  return (
    <div className="fixed bottom-3 left-3 z-50 flex items-center gap-1.5 text-[11px] text-white/90">
      <Link
        href="/"
        className="px-2 py-1 rounded bg-black/55 hover:bg-black/75 flex items-center gap-1 backdrop-blur"
      >
        <IconArrowLeft size={11} /> All screens
      </Link>
      <span className="px-2 py-1 rounded bg-black/55 backdrop-blur font-mono text-[10px]">
        {slug}
      </span>
      <span className="px-2 py-1 rounded bg-black/55 backdrop-blur max-w-[200px] truncate">
        {title}
      </span>
    </div>
  );
}

/* ---------- Variations data ---------- */

const allDraft: Bite[] = bites;

const someTaught: Bite[] = bites.map((b, i) =>
  i < 2 ? { ...b, status: "teaching-done", taughtChip: true } : b,
);

const inProgress: Bite[] = bites.map((b, i) => ({
  ...b,
  status: i < 2 ? "teaching-done" : i < 4 ? "auto-teaching" : "draft",
  taughtChip: i < 2,
}));

const allTeach: Bite[] = bites.map((b) => ({ ...b, status: "teach" }));

const allDone: Bite[] = bites.map((b) => ({
  ...b,
  status: "teaching-done",
  taughtChip: true,
}));

const emptySlots: StyleSlot[] = [
  { id: "default", label: "Default", bites: [], checkIns: true },
  { id: "instruction", label: "Instruction", bites: [], checkIns: true },
  { id: "practice", label: "Practice", bites: [], checkIns: true },
  { id: "review", label: "Review", bites: [], checkIns: true },
];

/* ---------- Per-slug rendering ---------- */

function renderScreen(slug: string) {
  switch (slug) {
    /* Variation 02 is the actual lesson creation home — everything starts here.
       This route is fully interactive: click the FAB, select tiles, drag into
       teaching-style slots, run Auto Teach, see progress + done state. */
    case "variation-02":
      return <AutoTeachFlow />;

    case "variation-01":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachFab />
        </AppShell>
      );

    case "widget-opens":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet ctaEnabled={false} styleSlots={emptySlots} />
        </AppShell>
      );

    case "instructions-sheet":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet showInstructions styleSlots={emptySlots} />
        </AppShell>
      );

    case "select-bites":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            selectedNumbers={[1, 2, 3]}
            styleSlots={emptySlots}
          />
        </AppShell>
      );

    case "cta-empty":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            ctaEnabled={false}
            styleSlots={emptySlots}
            errorToast="Select at least one bite and assign it to a teaching style."
          />
        </AppShell>
      );

    case "select-already-taught": {
      const tileStates: Partial<Record<number, BiteTileState>> = {
        2: "finalized",
      };
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            selectedNumbers={[2]}
            tileStates={tileStates}
            styleSlots={emptySlots}
            errorToast="Bite 2 is finalized, to teach it again change status to draft"
            ctaEnabled={false}
          />
        </AppShell>
      );
    }

    case "some-teaching-done": {
      const tileStates: Partial<Record<number, BiteTileState>> = {
        1: "finalized",
        2: "finalized",
        3: "available",
        4: "available",
      };
      return (
        <AppShell>
          <LessonsView bites={someTaught} />
          <AutoTeachSheet tileStates={tileStates} styleSlots={emptySlots} />
        </AppShell>
      );
    }

    case "remove-from-set": {
      const slots: StyleSlot[] = [
        { id: "default", label: "Default", bites: [1, 2], checkIns: true },
        { id: "instruction", label: "Instruction", bites: [], checkIns: true },
        { id: "practice", label: "Practice", bites: [], checkIns: true },
        { id: "review", label: "Review", bites: [], checkIns: true },
      ];
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            selectedNumbers={[1, 2]}
            styleSlots={slots}
            ctaEnabled
          />
          <Modal
            title="Remove bite from set?"
            primaryLabel="Remove"
            secondaryLabel="Keep"
            tone="warning"
          >
            Bite 03 will no longer be included in this Auto Teach run.
          </Modal>
        </AppShell>
      );
    }

    case "drop-in-set": {
      const slots: StyleSlot[] = [
        { id: "default", label: "Default", bites: [1, 2], checkIns: true },
        { id: "instruction", label: "Instruction", bites: [3], checkIns: true },
        { id: "practice", label: "Practice", bites: [4], checkIns: true },
        { id: "review", label: "Review", bites: [], checkIns: true },
      ];
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            selectedNumbers={[1, 2, 3, 4]}
            styleSlots={slots}
            ctaEnabled
          />
        </AppShell>
      );
    }

    case "enter-slide-desc":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <DescriptionEditor mode="slide" />
        </AppShell>
      );

    case "click-add-desc":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <DescriptionEditor mode="bite" />
        </AppShell>
      );

    case "save-description":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <DescriptionEditor mode="slide" saved />
        </AppShell>
      );

    case "both-descriptions":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <DescriptionEditor mode="both" saved />
        </AppShell>
      );

    case "click-bite-desc":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <DescriptionEditor mode="bite" saved />
        </AppShell>
      );

    case "autoteach-all-1": {
      const slots: StyleSlot[] = [
        { id: "default", label: "Default", bites: [1, 2, 3, 4, 5, 6], checkIns: true },
        { id: "instruction", label: "Instruction", bites: [], checkIns: true },
        { id: "practice", label: "Practice", bites: [], checkIns: true },
        { id: "review", label: "Review", bites: [], checkIns: true },
      ];
      return (
        <AppShell>
          <LessonsView bites={allTeach} />
          <AutoTeachSheet
            selectedNumbers={[1, 2, 3, 4, 5, 6]}
            styleSlots={slots}
            autoTeachAll
            ctaEnabled
          />
        </AppShell>
      );
    }

    case "autoteach-all-2":
      return (
        <AppShell>
          <LessonsView bites={allTeach} />
          <AutoTeachSheet
            selectedNumbers={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
            styleSlots={emptySlots}
            autoTeachAll
            ctaEnabled
          />
        </AppShell>
      );

    case "add-more-bites": {
      const slots: StyleSlot[] = [
        { id: "default", label: "Default", bites: [1, 2, 3], checkIns: true },
        { id: "instruction", label: "Instruction", bites: [4, 5], checkIns: true },
        { id: "practice", label: "Practice", bites: [], checkIns: true },
        { id: "review", label: "Review", bites: [], checkIns: true },
      ];
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            selectedNumbers={[1, 2, 3, 4, 5]}
            styleSlots={slots}
            ctaEnabled
          />
        </AppShell>
      );
    }

    case "in-progress": {
      const tileStates: Partial<Record<number, BiteTileState>> = {
        1: "finalized",
        2: "finalized",
        3: "available-selected",
        4: "available-selected",
      };
      return (
        <AppShell sidebarDisabled>
          <ProgressBanner completed={2} total={6} />
          <LessonsView bites={inProgress} />
          <AutoTeachFab variant="progress" disabled />
        </AppShell>
      );
    }

    case "navigate-during":
      return (
        <AppShell sidebarDisabled>
          <ProgressBanner completed={3} total={6} />
          <LessonsView bites={inProgress} />
          <Modal
            title="Leave Auto Teach?"
            primaryLabel="Leave anyway"
            secondaryLabel="Keep teaching"
            tone="warning"
          >
            Auto Teach is still running. If you leave, the remaining bites
            won&apos;t be generated.
          </Modal>
        </AppShell>
      );

    case "mark-final":
      return (
        <AppShell>
          <LessonsView bites={allDone} />
          <Modal
            title="Mark all taught slides as Final?"
            primaryLabel="Mark as Final"
            secondaryLabel="Cancel"
          >
            6 bites and 36 slides will be moved from Draft to Final. You can
            still edit them after.
          </Modal>
        </AppShell>
      );

    case "mark-draft":
      return (
        <AppShell>
          <LessonsView bites={allDone} />
          <Modal
            title="Move all slides back to Draft?"
            primaryLabel="Move to Draft"
            secondaryLabel="Cancel"
            tone="warning"
          >
            All slides will be marked as Draft so they won&apos;t appear in
            student decks.
          </Modal>
        </AppShell>
      );

    case "slide-instructions":
      return (
        <AppShell>
          <SlidePreview variant="instructions" />
        </AppShell>
      );

    case "one-not-taught": {
      const oneMissing = bites.map((b, i) =>
        i === 3
          ? { ...b, status: "draft" as const }
          : { ...b, status: "teaching-done" as const, taughtChip: true },
      );
      return (
        <AppShell>
          <LessonsView bites={oneMissing} />
          <Modal
            title="Bite 04 wasn’t taught"
            primaryLabel="Re-run for Bite 04"
            secondaryLabel="Dismiss"
          >
            We couldn&apos;t generate teaching for one of the bites. You can
            re-run Auto Teach for just that bite.
          </Modal>
        </AppShell>
      );
    }

    case "autoteach-click-1":
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachSheet
            selectedNumbers={[1, 2]}
            styleSlots={[
              { id: "default", label: "Default", bites: [1, 2], checkIns: true },
              { id: "instruction", label: "Instruction", bites: [], checkIns: true },
              { id: "practice", label: "Practice", bites: [], checkIns: true },
              { id: "review", label: "Review", bites: [], checkIns: true },
            ]}
            ctaEnabled
          />
        </AppShell>
      );

    case "autoteach-click-2":
      return (
        <AppShell sidebarDisabled>
          <ProgressBanner
            completed={0}
            total={2}
            message="Starting Auto Teach…"
          />
          <LessonsView bites={allDraft} />
        </AppShell>
      );

    case "teach-with-ai-1":
      return (
        <AppShell>
          <SlidePreview variant="preview" />
        </AppShell>
      );

    case "teach-with-ai-2":
      return (
        <AppShell>
          <SlidePreview variant="preview" />
          <AutoTeachFab />
        </AppShell>
      );

    case "slide-finalize":
      return (
        <AppShell>
          <SlidePreview variant="finalize" />
        </AppShell>
      );

    default:
      return (
        <AppShell>
          <LessonsView bites={allDraft} />
          <AutoTeachFab />
        </AppShell>
      );
  }
}
