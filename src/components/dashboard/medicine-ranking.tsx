import { money, number } from "@/lib/dashboard-period";
import type { TopMedicine } from "@/services/dashboard-query";

export function MedicineRanking({ medicines }: { medicines: TopMedicine[] }) {
  return (
    <section className="dashboard-panel" aria-labelledby="top-medicines">
      <div className="border-b border-border px-6 py-5">
        <h2 id="top-medicines" className="text-base font-semibold">
          Top medicines sold
        </h2>
        <p className="mt-1 text-sm text-muted">
          Ranked by units sold in the selected period.
        </p>
      </div>
      {medicines.length === 0 ? (
        <div className="px-6 py-14">
          <p className="font-medium">No medicine sales yet</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Medicines will appear here after a completed sale is recorded.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">
              The five best-selling medicines by units, with sales value in PKR
            </caption>
            <thead className="text-xs text-muted">
              <tr>
                <th scope="col" className="px-6 py-4 font-medium">
                  Medicine
                </th>
                <th scope="col" className="px-4 py-4 text-right font-medium">
                  Units
                </th>
                <th scope="col" className="px-6 py-4 text-right font-medium">
                  Sales
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {medicines.map((medicine, index) => (
                <tr key={medicine.id}>
                  <th scope="row" className="min-w-48 px-6 py-5 font-medium">
                    <span className="mr-3 text-xs text-muted">{index + 1}</span>
                    {medicine.name}
                  </th>
                  <td className="px-4 py-5 text-right tabular-nums">
                    {number(medicine.units)}
                  </td>
                  <td className="px-6 py-5 text-right whitespace-nowrap tabular-nums">
                    {money(medicine.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
