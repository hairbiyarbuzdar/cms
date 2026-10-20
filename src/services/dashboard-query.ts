import { Prisma, type PrismaClient } from "../generated/prisma/client";
import { getReportingWindow, type Period } from "../lib/dashboard-period";

export type DashboardSummary = {
  totalPatients: number;
  newPatients: number;
  completedSales: number;
  unitsSold: number;
  revenue: string;
  lowStockCount: number;
};
export type TopMedicine = {
  id: string;
  name: string;
  units: number;
  revenue: string;
};
export type LowStockMedicine = {
  id: string;
  name: string;
  stockOnHand: number;
  reorderLevel: number;
};
export type DailySale = { day: string; revenue: string; units: number };

// Keep this adapter separate so the real SQL can be tested against PostgreSQL.
// The server-only service below authorizes every call before reaching it.
export async function queryDashboard(
  db: PrismaClient,
  period: Period,
  now = new Date(),
) {
  const { start, end } = getReportingWindow(period, now);
  const [summary, topMedicines, lowStock, daily] = await db.$transaction(
    [
      db.$queryRaw<DashboardSummary[]>`
      SELECT
        (SELECT COUNT(*)::int FROM patient WHERE "registeredAt" <= ${end}) AS "totalPatients",
        (SELECT COUNT(*)::int FROM patient WHERE "registeredAt" >= ${start} AND "registeredAt" <= ${end}) AS "newPatients",
        (SELECT COUNT(*)::int FROM sale WHERE status = 'COMPLETED' AND "soldAt" >= ${start} AND "soldAt" <= ${end}) AS "completedSales",
        COALESCE(SUM(i.quantity), 0)::int AS "unitsSold",
        COALESCE(SUM(i.quantity * i."unitPrice"), 0)::text AS revenue,
        (SELECT COUNT(*)::int FROM medicine WHERE "stockOnHand" <= "reorderLevel") AS "lowStockCount"
      FROM "saleItem" i JOIN sale s ON s.id = i."saleId"
      WHERE s.status = 'COMPLETED' AND s."soldAt" >= ${start} AND s."soldAt" <= ${end}
    `,
      db.$queryRaw<TopMedicine[]>`
      SELECT m.id, m.name, SUM(i.quantity)::int AS units,
        SUM(i.quantity * i."unitPrice")::text AS revenue
      FROM "saleItem" i JOIN sale s ON s.id = i."saleId" JOIN medicine m ON m.id = i."medicineId"
      WHERE s.status = 'COMPLETED' AND s."soldAt" >= ${start} AND s."soldAt" <= ${end}
      GROUP BY m.id, m.name ORDER BY units DESC, SUM(i.quantity * i."unitPrice") DESC, m.name ASC, m.id ASC LIMIT 5
    `,
      db.$queryRaw<LowStockMedicine[]>`
      SELECT id, name, "stockOnHand", "reorderLevel" FROM medicine
      WHERE "stockOnHand" <= "reorderLevel" ORDER BY "stockOnHand" ASC, name ASC, id ASC LIMIT 5
    `,
      db.$queryRaw<DailySale[]>`
      SELECT to_char(d.day, 'YYYY-MM-DD') AS day,
        COALESCE(v.revenue, 0)::text AS revenue, COALESCE(v.units, 0)::int AS units
      FROM generate_series(
        (${start}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Karachi')::date,
        (${end}::timestamp AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Karachi')::date,
        interval '1 day'
      ) AS d(day)
      LEFT JOIN (
        SELECT (s."soldAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Karachi')::date AS day,
          SUM(i.quantity * i."unitPrice") AS revenue, SUM(i.quantity) AS units
        FROM sale s JOIN "saleItem" i ON i."saleId" = s.id
        WHERE s.status = 'COMPLETED' AND s."soldAt" >= ${start} AND s."soldAt" <= ${end}
        GROUP BY day
      ) v ON v.day = d.day::date ORDER BY d.day
    `,
    ],
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
  return {
    summary: summary[0],
    topMedicines,
    lowStock,
    daily,
    period,
    start,
    end,
  };
}

export type DashboardData = Awaited<ReturnType<typeof queryDashboard>>;
