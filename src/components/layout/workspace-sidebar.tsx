"use client";
import { SidebarContent, type Section } from "./sidebar-content";
import { SidebarDrawer } from "@/components/modals/sidebar-drawer";
export function WorkspaceSidebar({
  name,
  active,
}: {
  name: string;
  active: Section;
}) {
  return (
    <>
      <a
        href="#workspace-content"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-3 text-primary-foreground focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Skip to content
      </a>
      <aside
        aria-label="Sidebar"
        className="fixed inset-y-0 left-0 hidden w-64 flex-col overflow-y-auto border-r border-border bg-background px-4 py-8 md:flex"
      >
        <SidebarContent name={name} active={active} />
      </aside>
      <SidebarDrawer name={name} active={active} />
    </>
  );
}
