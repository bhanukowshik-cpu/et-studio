# ET Studio — Auto Teach Flow

Interactive React prototype of the Auto Teach flow from the [ET Studio Figma file](https://www.figma.com/design/KKJ9KLrW7vRBOPd6E8bdjL/ET-Studio?node-id=2671-379), built with Next.js 16 + Tailwind CSS.

**Live demo:** https://et-studio.vercel.app

---

## What's in here

A pixel-faithful, fully interactive build of the Auto Teach widget. The main route (`/`) lets you:

1. Click the sparkle FAB → opens the Auto Teach widget docked to the bottom-right.
2. Browse the 22 bites (paged behind "+ Load More"; backfills as you place tiles).
3. Drop bites into one of four teaching styles (Default / Instruction / Practice / Review).
4. Toggle per-style **Check-in's** (gated — needs at least one bite in the slot).
5. Use the per-style `•••` menu to open the inline **Add Bite Description** or **Add Specific Instructions** editor, which supports per-bite and "All Bites" targets, save / delete with a red popover, and persists across slot moves.
6. Toggle "Auto teach all bites" (just the mode) or click "Default ✏️" (opens the expanded auto-teach-all editor that requires every assignable bite placed before the CTA enables).
7. Run Auto Teach — sticky progress banner at top, dimmed widget, disabled Teach buttons on bites; on completion bites 1 & 2 surface their post-teach states (Finalized + Edit, Draft + Finalize + kabab with "Slide Instructions" / "Redo Teaching").
8. Open the **Instructions Sheet** modal from the widget for a card grid of teaching-style descriptions.

Snapshot routes for every state of the flow are pre-rendered at `/s/<slug>` — see the full list in [`src/data/screens.ts`](src/data/screens.ts).

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 3** + Mulish & Inter via Google Fonts
- **TypeScript** strict mode
- React state only — no external store
- HTML5 drag-and-drop API + `React.createPortal` for popovers/menus that escape the widget's overflow

## Run locally

```bash
# Node 18+ recommended (built on Node 25)
npm install
npm run dev          # http://localhost:3000

npm run build        # production build
npm start            # serve the production build
```

## Deploy

The project is already deployed on Vercel under the `et-studio` project. To redeploy:

```bash
npm install -g vercel       # if not installed
vercel login                # use the project owner's account
vercel deploy --prod --yes  # deploys to https://et-studio.vercel.app
```

For a static export instead, set `output: "export"` in `next.config.mjs` and `npm run build` — assets land in `out/`.

## Project layout

```
src/
  app/
    page.tsx                  # Main interactive flow (renders <AutoTeachFlow />)
    s/[slug]/page.tsx         # Snapshot routes per Figma state
    layout.tsx                # Loads Inter + Mulish fonts
    globals.css               # Tailwind base
  components/
    AutoTeachFlow.tsx         # The whole stateful widget — drag/drop, slots, descriptions, run loop
    AutoTeachFab.tsx          # White circular FAB with rainbow halo
    AppShell.tsx              # Green app header + left tool sidebar
    AppHeader.tsx
    ToolSidebar.tsx
    BiteCard.tsx              # Lesson row: title, status chip, toolbar, Preview/Teach (or post-teach variant)
    BiteTile.tsx              # 44×33 numbered tile with state stripes + blue description dot
    LessonsView.tsx           # Stacks BiteCards
    SlotCard.tsx              # (Inlined in AutoTeachFlow) drop target with check-in toggle + kabab menu
    DescriptionPanel.tsx      # (Inlined in AutoTeachFlow) inline editor for descriptions/instructions
    InstructionsSheetModal.tsx
    ProgressBanner.tsx        # Sticky strip at top during auto-teach runs
    Modal.tsx
    SlidePreview.tsx
    icons.tsx                 # Inline SVG icons
  data/
    bites.ts                  # Bite metadata + 22-tile seed
    screens.ts                # Snapshot route catalogue
public/                       # (empty — fonts come from Google)
```

## Notable design choices

- The interactive widget body uses **HTML5 DnD**; for popovers / menus that escape the widget's overflow (`•••` menu, delete pill, remove-bite popover) we render via **React Portal** with absolute viewport coords computed from the trigger's `getBoundingClientRect`.
- Descriptions stored as `slotId:target` keys with smart **expansion**: saving "All Bites" writes per-bite copies for every current bite; later dropping a fresh bite makes the chip row collapse from `[All]` back to `[3, 5, 6]` automatically.
- The blue indicator (description/instructions exist) lives in **`biteHasAnyDescription(n)`** which scans both stores across all slots, so the dot **persists** even after the bite is removed from a slot.
- Tile visual state composes: top stripe = teaching/finalized, body color = selected/idle, corner dot = blue indicator.
- The auto-teach-all editor dims the standard sections behind it but shares the same `slots` / `checkIns` / `descriptions` state — there's no parallel "auto-teach mode" data, only a different surface.
- Post-teach view: when `phase === "done"`, bites 1 and 2 receive `taughtVariant` (`"finalized"` and `"draft"` respectively) — this swaps their toolbar to Preview EverTutor + Edit/Finalize, surfaces the kabab menu for draft, and renders the "✨ Auto-taught with AI" chip below.

## Things wired but not yet connected to real data

- The Auto Teach run is a simulated `setTimeout` loop (1 s per bite). Replace `startAutoTeach` in `AutoTeachFlow.tsx` with the real API call.
- The kabab menu's "Slide Instructions" / "Redo Teaching" actions are stubs.
- "Preview EverTutor", "Save", "Publish", "Import", "Export", "Group", "Un-Group", undo/redo in the app header are visual only.

## License

Internal prototype — all rights reserved by Everise / ET Studio team.
