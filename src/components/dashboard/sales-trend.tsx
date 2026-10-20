import { money } from "@/lib/dashboard-period";
import type { DailySale } from "@/services/dashboard-query";

export function SalesTrend({ daily }: { daily: DailySale[] }) {
  const peak = Math.max(...daily.map((day) => Number(day.revenue)), 0);
  const label = (value: string) =>
    new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${value}T00:00:00Z`));
  return (
    <section className="dashboard-panel" aria-labelledby="trend-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 pt-6">
        <div>
          <h2 id="trend-heading" className="text-base font-semibold">
            Medicine sales over time
          </h2>
          <p className="mt-1 text-sm text-muted">Daily completed sales · PKR</p>
        </div>
        <span className="text-xs text-muted">Peak day: {money(peak)}</span>
      </div>
      {peak === 0 ? (
        <div className="px-6 py-14">
          <p className="font-medium">Your sales trend starts here</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            No completed sales in this period. Each day’s medicine sales will
            appear here.
          </p>
        </div>
      ) : (
        <figure className="px-6 pt-8 pb-6">
          <svg
            viewBox="0 0 900 180"
            className="h-44 w-full text-primary"
            role="img"
            aria-label={`Daily medicine sales across ${daily.length} days. Highest daily sales ${money(peak)}.`}
            preserveAspectRatio="none"
          >
            {daily.map((day, index) => {
              const height = (Number(day.revenue) / peak) * 164;
              return (
                <rect
                  key={day.day}
                  x={(index * 900) / daily.length + 2}
                  y={180 - height}
                  width={Math.max(1, 900 / daily.length - 4)}
                  height={height}
                  rx="2"
                  fill="currentColor"
                >
                  <title>
                    {label(day.day)}: {money(day.revenue)}
                  </title>
                </rect>
              );
            })}
          </svg>
          <figcaption className="mt-3 flex justify-between text-xs text-muted">
            <span>{label(daily[0].day)}</span>
            <span>{label(daily[daily.length - 1].day)}</span>
          </figcaption>
          <details className="mt-5 text-sm">
            <summary className="w-fit cursor-pointer text-muted focus-visible:outline-2 focus-visible:outline-primary">
              View daily totals
            </summary>
            <div className="mt-3 max-h-60 overflow-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr>
                    <th scope="col" className="py-2">
                      Date
                    </th>
                    <th scope="col" className="text-right">
                      Sales (PKR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {daily.map((day) => (
                    <tr key={day.day} className="border-t border-border">
                      <th scope="row" className="py-2 font-normal">
                        {label(day.day)}
                      </th>
                      <td className="text-right tabular-nums">
                        {money(day.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </figure>
      )}
    </section>
  );
}
