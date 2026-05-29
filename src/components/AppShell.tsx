import AppHeader from "./AppHeader";
import ToolSidebar from "./ToolSidebar";

type Props = {
  title?: string;
  publishVersion?: string;
  lastSaved?: string;
  sidebarDisabled?: boolean;
  children: React.ReactNode;
};

export default function AppShell({
  title,
  publishVersion,
  lastSaved,
  sidebarDisabled,
  children,
}: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4F4F4]">
      <AppHeader
        title={title}
        publishVersion={publishVersion}
        lastSaved={lastSaved}
      />
      <div className="flex flex-1 min-h-0">
        <ToolSidebar disabled={sidebarDisabled} />
        <main className="flex-1 overflow-y-auto px-10 py-6">{children}</main>
      </div>
    </div>
  );
}
