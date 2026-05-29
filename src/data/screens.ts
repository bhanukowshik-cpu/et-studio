export type ScreenMeta = {
  slug: string;
  title: string;
  description: string;
  /** Roughly grouped flow stage */
  group:
    | "Base"
    | "Selection"
    | "Set Building"
    | "Descriptions"
    | "In Progress"
    | "Post Teach"
    | "Slide Preview";
};

export const screens: ScreenMeta[] = [
  {
    slug: "variation-02",
    title: "▶ Interactive Auto Teach flow",
    description:
      "The real flow. Click the sparkle FAB to open the widget, click tiles to select, drag them into Default/Instruction/Practice/Review, then run Auto Teach.",
    group: "Base",
  },
  {
    slug: "variation-01",
    title: "Variation 01",
    description: "Alternate scrolled view with the 'All your Lessons' heading.",
    group: "Base",
  },
  {
    slug: "widget-opens",
    title: "Auto Teach widget opens",
    description: "First click on Auto Teach surfaces the picker sheet.",
    group: "Selection",
  },
  {
    slug: "instructions-sheet",
    title: "Instructions sheet",
    description: "User opens the instructions side sheet.",
    group: "Selection",
  },
  {
    slug: "select-bites",
    title: "Selecting bites",
    description: "User picks bites to include in the teaching set.",
    group: "Selection",
  },
  {
    slug: "cta-empty",
    title: "Auto Teach CTA — empty",
    description: "Clicking Auto Teach with no bites selected.",
    group: "Selection",
  },
  {
    slug: "select-already-taught",
    title: "Re-select already taught",
    description: "Selecting a bite that already has teaching done.",
    group: "Selection",
  },
  {
    slug: "some-teaching-done",
    title: "Some bites already taught",
    description: "Mixed state — some bites done, some not.",
    group: "Set Building",
  },
  {
    slug: "remove-from-set",
    title: "Remove from teaching set",
    description: "User removes a bite from the active set.",
    group: "Set Building",
  },
  {
    slug: "drop-in-set",
    title: "Drop bites into set",
    description: "Drag-and-drop bites into the specific set.",
    group: "Set Building",
  },
  {
    slug: "enter-slide-desc",
    title: "Enter slide description",
    description: "Inline editor for slide description / speaker notes.",
    group: "Descriptions",
  },
  {
    slug: "click-add-desc",
    title: "Click add description",
    description: "Triggering the add bite / slide description action.",
    group: "Descriptions",
  },
  {
    slug: "save-description",
    title: "Save description",
    description: "Confirmation state after saving the description.",
    group: "Descriptions",
  },
  {
    slug: "both-descriptions",
    title: "Both descriptions added",
    description: "Bite and slide descriptions both present.",
    group: "Descriptions",
  },
  {
    slug: "click-bite-desc",
    title: "Click bite description",
    description: "Re-opening an existing bite description.",
    group: "Descriptions",
  },
  {
    slug: "autoteach-all-1",
    title: "Auto teach all bites (a)",
    description: "Variant A: clicking Auto teach for all bites.",
    group: "In Progress",
  },
  {
    slug: "autoteach-all-2",
    title: "Auto teach all bites (b)",
    description: "Variant B: clicking Auto teach for all bites.",
    group: "In Progress",
  },
  {
    slug: "add-more-bites",
    title: "Add more bites to set",
    description: "Adding additional bites mid-flow.",
    group: "Set Building",
  },
  {
    slug: "in-progress",
    title: "Auto Teach in progress",
    description: "Disabled UI while auto teach is running.",
    group: "In Progress",
  },
  {
    slug: "navigate-during",
    title: "Navigate during auto teach",
    description: "Confirm dialog when user tries to leave.",
    group: "In Progress",
  },
  {
    slug: "mark-final",
    title: "Mark all taught — Final",
    description: "Bulk action to mark taught slides as Final.",
    group: "Post Teach",
  },
  {
    slug: "mark-draft",
    title: "Mark all taught — Draft",
    description: "Bulk action to mark taught slides as Draft.",
    group: "Post Teach",
  },
  {
    slug: "slide-instructions",
    title: "Slide instructions",
    description: "Inspecting the slide instructions panel.",
    group: "Post Teach",
  },
  {
    slug: "one-not-taught",
    title: "One slide not taught",
    description: "Surface the bite that wasn't fully taught.",
    group: "Post Teach",
  },
  {
    slug: "autoteach-click-1",
    title: "Click Auto teach (a)",
    description: "Variant A: clicking Auto teach.",
    group: "Selection",
  },
  {
    slug: "autoteach-click-2",
    title: "Click Auto teach (b)",
    description: "Variant B: clicking Auto teach.",
    group: "Selection",
  },
  {
    slug: "teach-with-ai-1",
    title: "Teach with AI (a)",
    description: "Variant A: Teach with AI initial flow.",
    group: "Slide Preview",
  },
  {
    slug: "teach-with-ai-2",
    title: "Teach with AI (b)",
    description: "Variant B: Teach with AI initial flow.",
    group: "Slide Preview",
  },
  {
    slug: "slide-finalize",
    title: "Slide Preview & Finalize",
    description: "Final slide review screen.",
    group: "Slide Preview",
  },
];

export const getScreen = (slug: string) =>
  screens.find((s) => s.slug === slug);
