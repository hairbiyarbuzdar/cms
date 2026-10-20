import Link from "next/link";
import { periods, reportingTimeZone } from "@/lib/dashboard-period";
import type { DashboardData } from "@/services/dashboard-query";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { MetricSummary } from "./metric-summary";
import { MedicineRanking } from "./medicine-ranking";
import { SalesTrend } from "./sales-trend";
import { StockWatch } from "./stock-watch";

export function DashboardOverview({
  data,
  name,
}: {
  data: DashboardData;
  name: string;
}) {
  const date = (value: Date) =>
    new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: reportingTimeZone,
    }).format(value);
  return (
    <WorkspaceShell name={name} active="dashboard">
      <main className="mx-auto max-w-7xl space-y-7 px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Patients, medicine sales, and stock at a glance.
            </p>
          </div>
          <nav
            aria-label="Reporting period"
            className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-background p-1"
          >
            {periods.map((period) => (
              <Link
                key={period}
                href={`/dashboard?period=${period}`}
                aria-current={period === data.period ? "page" : undefined}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${period === data.period ? "bg-primary text-primary-foreground" : "text-muted hover:bg-surface hover:text-foreground"}`}
              >
                {period} days
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <p>
            {date(data.start)} – {date(data.end)} · Pakistan time
          </p>
          <p>
            Updated{" "}
            {new Intl.DateTimeFormat("en-PK", {
              hour: "numeric",
              minute: "2-digit",
              timeZone: reportingTimeZone,
            }).format(data.end)}
          </p>
        </div>
        <MetricSummary summary={data.summary} period={data.period} />
        <SalesTrend daily={data.daily} />
        <div className="grid items-start gap-7 lg:grid-cols-5">
          <div className="min-w-0 lg:col-span-3">
            <MedicineRanking medicines={data.topMedicines} />
          </div>
          <div className="min-w-0 lg:col-span-2">
            <StockWatch
              medicines={data.lowStock}
              total={data.summary.lowStockCount}
            />
          </div>
        </div>
        <p className="pb-4 text-xs leading-5 text-muted">
          Sales include completed transactions only. Voided and refunded sales
          are excluded. Patient totals and stock levels are current.
        </p>
      </main>
    </WorkspaceShell>
  );
}
