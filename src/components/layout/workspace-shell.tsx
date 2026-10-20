import type { ReactNode } from "react";
import { WorkspaceSidebar } from "./workspace-sidebar";

export function WorkspaceShell({
  name,
  active,
  children,
}: {
  name: string;
  active: "dashboard" | "patients";
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-surface">
      <WorkspaceSidebar name={name} active={active} />
      <div id="workspace-content" tabIndex={-1} className="min-w-0 md:pl-64">
        {children}
      </div>
    </div>
  );
}
