"use client";

import { useEffect, useRef } from "react";
import {
  SidebarContent,
  type Section,
} from "@/components/layout/sidebar-content";

export function SidebarDrawer({
  name,
  active,
}: {
  name: string;
  active: Section;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 768px)");
    const closeOnDesktop = () => {
      if (desktop.matches) dialog.current?.close();
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);
  return (
    <>
      <div className="px-6 pt-6 md:hidden">
        <button
          type="button"
          onClick={() => dialog.current?.showModal()}
          aria-haspopup="dialog"
          aria-controls="workspace-menu"
          className="button-secondary gap-2"
        >
          <svg
            aria-hidden="true"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Menu
        </button>
      </div>
      <dialog
        ref={dialog}
        id="workspace-menu"
        aria-label="Workspace menu"
        className="sidebar-drawer fixed inset-y-0 left-0 m-0 h-dvh max-h-none w-72 max-w-[calc(100%_-_2rem)] overflow-y-auto border-0 border-r border-border bg-background p-4 text-foreground"
      >
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={() => dialog.current?.close()}
            className="button-secondary"
            aria-label="Close menu"
          >
            Close
          </button>
        </div>
        <div className="flex min-h-[calc(100%_-_5rem)] flex-col">
          <SidebarContent
            name={name}
            active={active}
            onNavigate={() => dialog.current?.close()}
          />
        </div>
      </dialog>
    </>
  );
}
