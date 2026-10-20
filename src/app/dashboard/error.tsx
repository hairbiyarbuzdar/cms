"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto max-w-sm px-6 py-20">
      <h1 className="text-2xl font-semibold">Workspace unavailable</h1>
      <p className="my-6 text-sm leading-6 text-muted">
        We couldn’t load your workspace. Please try again shortly.
      </p>
      <button className="button-primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
