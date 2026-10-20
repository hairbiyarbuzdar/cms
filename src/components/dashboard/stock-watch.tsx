import { number } from "@/lib/dashboard-period";
import type { LowStockMedicine } from "@/services/dashboard-query";

export function StockWatch({
  medicines,
  total,
}: {
  medicines: LowStockMedicine[];
  total: number;
}) {
  return (
    <section className="dashboard-panel" aria-labelledby="stock-heading">
      <div className="border-b border-border px-6 py-5">
        <h2 id="stock-heading" className="text-base font-semibold">
          Stock watch <span className="ml-2 text-muted">{number(total)}</span>
        </h2>
        <p className="mt-1 text-sm text-muted">
          At or below the reorder level, right now.
        </p>
      </div>
      {medicines.length === 0 ? (
        <div className="px-6 py-14">
          <p className="font-medium">No low-stock alerts</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Alerts will appear when a medicine reaches its reorder level.
          </p>
        </div>
      ) : (
        <>
          <ul className="divide-y divide-border">
            {medicines.map((medicine) => (
              <li
                key={medicine.id}
                className="flex items-center justify-between gap-4 px-6 py-5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words">
                    {medicine.name}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Reorder level: {number(medicine.reorderLevel)}
                  </p>
                </div>
                <span
                  className={
                    medicine.stockOnHand === 0
                      ? "shrink-0 text-sm font-medium text-danger"
                      : "shrink-0 text-sm font-medium"
                  }
                >
                  {medicine.stockOnHand === 0
                    ? "Out of stock"
                    : `${number(medicine.stockOnHand)} left`}
                </span>
              </li>
            ))}
          </ul>
          {total > medicines.length && (
            <p className="border-t border-border px-6 py-4 text-xs text-muted">
              Showing the {medicines.length} lowest-stock medicines of{" "}
              {number(total)}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
