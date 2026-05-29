import {
  IconText,
  IconDraw,
  IconShapes,
  IconImage,
  IconUnderline,
  IconInput,
} from "./icons";

const tools = [
  { id: "text", label: "Text", icon: IconText },
  { id: "draw", label: "Draw", icon: IconDraw },
  { id: "shapes", label: "Shapes", icon: IconShapes },
  { id: "images", label: "Images", icon: IconImage },
  { id: "icons", label: "Icons /\nUnderlines", icon: IconUnderline },
  { id: "input", label: "Input", icon: IconInput },
];

export default function ToolSidebar({ disabled = false }: { disabled?: boolean }) {
  return (
    <aside
      className={`w-[68px] bg-white shrink-0 border-r border-ink-line py-4 flex flex-col items-center gap-3 ${
        disabled ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {tools.map((t) => {
        const Icon = t.icon;
        return (
          <button
            key={t.id}
            type="button"
            className="group w-[54px] py-2 rounded-lg flex flex-col items-center gap-1 hover:bg-ink-line/40 transition-colors"
          >
            <Icon size={22} className="text-ink-soft" />
            <span className="text-[10px] leading-[12px] text-ink-soft whitespace-pre text-center">
              {t.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
