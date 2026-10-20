import "dotenv/config";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { getReportingWindow, parsePeriod } from "../src/lib/dashboard-period";
import { queryDashboard } from "../src/services/dashboard-query";

test("reporting window follows Pakistan calendar days across UTC boundaries", () => {
  assert.equal(parsePeriod(undefined), 30);
  assert.equal(parsePeriod("invalid"), 30);
  assert.equal(parsePeriod(["7"]), 30);
  assert.equal(parsePeriod("7"), 7);
  const window = getReportingWindow(7, new Date("2026-10-19T20:00:00Z"));
  assert.equal(window.start.toISOString(), "2026-10-13T19:00:00.000Z");
});

test("PostgreSQL dashboard aggregates accurate revenue, rankings, empty dates and stock", async () => {
  assert.ok(
    process.env.DATABASE_URL,
    "DATABASE_URL is required for dashboard integration tests",
  );
  const schema = `dashboard_test_${randomUUID().replaceAll("-", "")}`;
  assert.match(schema, /^dashboard_test_[a-f0-9]+$/);
  const control = new Client({ connectionString: process.env.DATABASE_URL });
  await control.connect();
  let db: PrismaClient | undefined;
  try {
    await control.query(`CREATE SCHEMA "${schema}"`);
    await control.query(`SET search_path TO "${schema}"`);
    await control.query(
      await readFile(
        "prisma/migrations/20261020010000_dashboard/migration.sql",
        "utf8",
      ),
    );
    const url = new URL(process.env.DATABASE_URL);
    url.searchParams.set("options", `-c search_path=${schema}`);
    db = new PrismaClient({
      adapter: new PrismaPg({ connectionString: url.toString() }),
    });
    const now = new Date("2026-10-20T12:00:00Z");
    const empty = await queryDashboard(db, 30, now);
    assert.equal(empty.summary.totalPatients, 0);
    assert.equal(Number(empty.summary.revenue), 0);
    assert.equal(empty.daily.length, 30);
    assert.deepEqual(empty.topMedicines, []);
    await control.query(`
      INSERT INTO patient (id, name, "registeredAt") VALUES
        ('p1', 'Old patient', '2026-01-01'),
        ('p2', 'At start', '2026-09-20 19:00:00'),
        ('p3', 'Today', '2026-10-20 10:00:00'),
        ('p4', 'Future', '2026-10-21');
      INSERT INTO medicine (id, name, "stockOnHand", "reorderLevel") VALUES
        ('m1', 'Medicine A', 0, 10), ('m2', 'Medicine B', 10, 10), ('m3', 'Medicine C', 20, 10);
      INSERT INTO sale (id, "soldAt", status) VALUES
        ('s1', '2026-09-20 19:00:00', 'COMPLETED'),
        ('s2', '2026-10-20 10:00:00', 'COMPLETED'),
        ('s3', '2026-10-20 10:00:00', 'VOID'),
        ('s4', '2026-10-20 10:00:00', 'REFUNDED'),
        ('s5', '2026-09-20 18:59:59', 'COMPLETED'),
        ('s6', '2026-10-21', 'COMPLETED');
      INSERT INTO "saleItem" (id, "saleId", "medicineId", quantity, "unitPrice") VALUES
        ('i1', 's1', 'm1', 2, 100.10), ('i2', 's2', 'm2', 3, 25.55),
        ('i3', 's3', 'm3', 100, 999), ('i4', 's4', 'm3', 100, 999),
        ('i5', 's5', 'm3', 100, 999), ('i6', 's6', 'm3', 100, 999);
    `);
    const result = await queryDashboard(db, 30, now);
    assert.deepEqual(result.summary, {
      totalPatients: 3,
      newPatients: 2,
      completedSales: 2,
      unitsSold: 5,
      revenue: "276.85",
      lowStockCount: 2,
    });
    assert.equal(result.topMedicines[0].name, "Medicine B");
    assert.equal(result.topMedicines[0].units, 3);
    assert.equal(result.daily[0].day, "2026-09-21");
    assert.equal(result.daily[0].revenue, "200.20");
    assert.equal(result.daily.at(-1)?.revenue, "76.65");
    assert.equal(result.daily[1].revenue, "0");
    assert.equal(result.lowStock[0].stockOnHand, 0);
    const short = await queryDashboard(db, 7, now);
    assert.equal(short.summary.unitsSold, 3);
    assert.equal(short.summary.newPatients, 1);
    await assert.rejects(
      control.query(
        `INSERT INTO medicine (id, name, "stockOnHand") VALUES ('bad', 'Invalid', -1)`,
      ),
    );
  } finally {
    await db?.$disconnect();
    // Only the unique schema created above is removed; application data is untouched.
    await control.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await control.end();
  }
});
