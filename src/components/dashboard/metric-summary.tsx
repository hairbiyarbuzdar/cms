import { money, number } from "@/lib/dashboard-period";
import type { DashboardSummary } from "@/services/dashboard-query";

export function MetricSummary({
  summary,
  period,
}: {
  summary: DashboardSummary;
  period: number;
}) {
  const metrics = [
    {
      label: "Total patients",
      value: number(summary.totalPatients),
      detail: "Registered to date",
    },
    {
      label: "New patients",
      value: number(summary.newPatients),
      detail: `Last ${period} days, including today`,
    },
    {
      label: "Medicine sales",
      value: money(summary.revenue),
      detail: `${number(summary.completedSales)} completed sales`,
    },
    {
      label: "Units sold",
      value: number(summary.unitsSold),
      detail: `Last ${period} days, including today`,
    },
  ];
  return (
    <dl className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-xl border border-border bg-background sm:grid-cols-2 sm:divide-y-0 xl:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="min-w-0 px-6 py-7 sm:border-r sm:border-b sm:border-border xl:border-b-0"
        >
          <dt className="text-sm font-medium text-muted">{metric.label}</dt>
          <dd className="mt-4 text-3xl font-semibold tracking-tight break-words tabular-nums">
            {metric.value}
          </dd>
          <dd className="mt-2 text-xs leading-5 text-muted">{metric.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
