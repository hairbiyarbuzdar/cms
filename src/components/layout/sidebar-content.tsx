"use client";
import Link from "next/link";
import { SignOutButton } from "@/components/shared/sign-out-button";
export type Section = "dashboard" | "patients";

export function SidebarContent({
  name,
  active,
  onNavigate,
}: {
  name: string;
  active: Section;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="mb-10 w-fit rounded-sm px-4 text-2xl font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-primary"
      >
        cms<span className="text-muted">.</span>
      </Link>
      <nav aria-label="Workspace" className="space-y-2">
        {(
          [
            ["dashboard", "Dashboard"],
            ["patients", "Patients"],
          ] as const
        ).map(([route, label]) => (
          <Link
            key={route}
            href={`/${route}`}
            onClick={onNavigate}
            aria-current={active === route ? "page" : undefined}
            className={`flex min-h-12 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${active === route ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
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
              strokeLinejoin="round"
            >
              {route === "dashboard" ? (
                <>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </>
              ) : (
                <>
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-4-5.65" />
                </>
              )}
            </svg>
            {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto px-4 pt-10">
        <div className="border-t border-border pt-5">
          <p className="text-sm font-medium break-words">{name}</p>
          <p className="mt-1 mb-4 text-xs text-muted">Clinic workspace</p>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
