import type { PatientList } from "@/services/patient-query";

export function PatientSummary({
  summary,
}: {
  summary: PatientList["summary"];
}) {
  const metrics = [
    ["Total patients", summary.all, "All registered patients"],
    ["Today’s patients", summary.daily, "Registered today"],
    ["This week", summary.weekly, "Monday to today"],
    ["This month", summary.monthly, "Registered this month"],
  ] as const;
  return (
    <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(([label, value, detail], i) => (
        <div
          key={label}
          className="dashboard-panel flex items-center gap-4 px-5 py-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface text-foreground">
            <svg
              aria-hidden="true"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {i < 2 ? (
                <>
                  <circle cx="9" cy="8" r="3" />
                  <path d="M3 21v-3a6 6 0 0 1 12 0v3M17 7v6M14 10h6" />
                </>
              ) : (
                <>
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M7 3v4M17 3v4M3 11h18M8 15h3M8 18h6" />
                </>
              )}
            </svg>
          </span>
          <div className="min-w-0">
            <dt className="text-xs font-medium text-muted">{label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
              {value.toLocaleString("en-PK")}
            </dd>
            <dd className="mt-1 text-xs text-muted">{detail}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}
