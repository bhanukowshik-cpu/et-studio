import Link from "next/link";
import {
  IconExternal,
  IconUndo,
  IconRedo,
  IconChevronDown,
} from "./icons";

type Props = {
  title?: string;
  publishVersion?: string;
  lastSaved?: string;
};

export default function AppHeader({
  title = "Find the Area",
  publishVersion = "1/7",
  lastSaved = "Last Saved 10 min ago",
}: Props) {
  return (
    <header className="h-[72px] bg-[#0E6F44] text-white flex items-center px-6 gap-8 shrink-0">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-[15px] font-semibold underline underline-offset-4 decoration-white/80 group-hover:decoration-white">
          {title}
        </span>
        <IconExternal size={13} className="opacity-90" />
      </Link>

      <div className="ml-auto flex items-center gap-2.5">
        <HeaderButton>Import</HeaderButton>
        <HeaderButton>Export</HeaderButton>
        <HeaderButton>Group</HeaderButton>
        <HeaderButton>Un-Group</HeaderButton>

        <div className="mx-2 flex items-center gap-3 text-white/95">
          <button
            aria-label="Undo"
            className="p-1 rounded hover:bg-white/10"
            type="button"
          >
            <IconUndo size={18} />
          </button>
          <button
            aria-label="Redo"
            className="p-1 rounded hover:bg-white/10"
            type="button"
          >
            <IconRedo size={18} />
          </button>
        </div>

        <HeaderButton>Save</HeaderButton>
        <div className="flex flex-col items-end">
          <button
            type="button"
            className="h-[34px] px-3 flex items-center gap-1.5 rounded-md bg-white text-[#0E6F44] text-[13px] font-semibold hover:bg-white/95"
          >
            Publish {publishVersion}
            <IconChevronDown size={14} />
          </button>
          <span className="text-[10px] text-white/80 mt-0.5">{lastSaved}</span>
        </div>
      </div>
    </header>
  );
}

function HeaderButton({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="h-[34px] px-3.5 rounded-md border border-white/70 text-[13px] font-medium hover:bg-white/10 transition-colors"
    >
      {children}
    </button>
  );
}
