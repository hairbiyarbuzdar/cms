import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { test } from "node:test";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  patientSchema,
  patientNumber,
  parsePatientFilters,
  parsePatientOptions,
  defaultPatientOptions,
  patientAge,
} from "../src/lib/patient-validation";
import { insertPatient, queryPatients } from "../src/services/patient-query";

const input = () => ({
  name: "Test patient",
  phone: "",
  dateOfBirth: "",
  gender: "" as const,
  address: "",
  registrationKey: randomUUID(),
});

test("patient validation rejects invalid dates and phones without rejecting Unicode names", () => {
  assert.equal(
    patientSchema.safeParse({ ...input(), name: "  علی احمد  " }).success,
    true,
  );
  for (const changes of [
    { name: " " },
    { dateOfBirth: "2025-02-30" },
    { dateOfBirth: "2100-01-01" },
    { phone: "abcd" },
    { gender: "ADMIN" },
    { registrationKey: "bad" },
    { ageAtRegistration: "131" },
    { ageAtRegistration: "-1" },
    { notes: "x".repeat(2001) },
  ]) {
    assert.equal(
      patientSchema.safeParse({ ...input(), ...changes }).success,
      false,
    );
  }
  assert.equal(
    patientSchema.parse({ ...input(), name: "  Ayesha Khan " }).name,
    "Ayesha Khan",
  );
  assert.equal(patientNumber(42), "PT-000042");
  assert.deepEqual(parsePatientFilters(["bad"], "-1"), { query: "", page: 1 });
  assert.equal(
    parsePatientOptions({ from: "2026-02-31", size: "999" }).from,
    "",
  );
  assert.equal(parsePatientOptions({}).pageSize, 8);
  assert.equal(
    patientAge(new Date("2000-10-21"), null, new Date("2026-10-20")),
    25,
  );
  assert.equal(patientAge(null, 34), 34);
});

test("PostgreSQL registration is retry-safe and supports stable pagination and search", async () => {
  assert.ok(process.env.DATABASE_URL);
  const schema = `patient_test_${randomUUID().replaceAll("-", "")}`;
  assert.match(schema, /^patient_test_[a-f0-9]+$/);
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
    // Existing patients receive numbers when the migration is applied.
    await control.query(
      `INSERT INTO patient (id, name) VALUES ('existing', 'Legacy patient')`,
    );
    await control.query(
      await readFile(
        "prisma/migrations/20261020020000_patient_registration/migration.sql",
        "utf8",
      ),
    );
    await control.query(
      await readFile(
        "prisma/migrations/20261020030000_patient_details/migration.sql",
        "utf8",
      ),
    );
    db = new PrismaClient({
      adapter: new PrismaPg(
        { connectionString: process.env.DATABASE_URL },
        { schema },
      ),
    });
    const details = patientSchema.parse({
      ...input(),
      name: "  Ayesha Khan  ",
      phone: "0300 1234567",
      dateOfBirth: "2000-02-29",
      gender: "Female",
      ageAtRegistration: "26",
      externalId: "TEST-ID-001",
      notes: "Synthetic test notes",
    });
    const [first, retry] = await Promise.all([
      insertPatient(db, details),
      insertPatient(db, details),
    ]);
    assert.equal(first.id, retry.id);
    assert.equal(first.name, "Ayesha Khan");
    assert.equal(first.dateOfBirth?.toISOString(), "2000-02-29T00:00:00.000Z");
    assert.equal(await db.patient.count(), 2);
    assert.equal(
      (await queryPatients(db, "aYeShA", 1)).patients[0].id,
      first.id,
    );
    assert.equal((await queryPatients(db, "1234567", 1)).total, 1);
    assert.equal(
      (await queryPatients(db, patientNumber(first.patientNumber), 1))
        .patients[0].id,
      first.id,
    );
    await db.patient.createMany({
      data: Array.from({ length: 26 }, (_, i) => ({
        name: `Paging patient ${i}`,
      })),
    });
    const page1 = await queryPatients(db, "", 1);
    const page2 = await queryPatients(db, "", 2);
    assert.equal(page1.patients.length, 25);
    assert.equal(page2.patients.length, 3);
    assert.equal(
      new Set([...page1.patients, ...page2.patients].map((p) => p.id)).size,
      28,
    );
    assert.equal((await queryPatients(db, "no matching name", 999)).page, 1);
    assert.equal((await queryPatients(db, "", 999)).page, 2);
    assert.equal(await db.patient.count(), 28);
    assert.equal(first.externalId, "TEST-ID-001");
    assert.equal(first.notes, "Synthetic test notes");
    await assert.rejects(
      insertPatient(db, { ...details, registrationKey: randomUUID() }),
    );
    const filtered = await queryPatients(db, "", 1, {
      ...defaultPatientOptions,
      gender: "Female",
    });
    assert.equal(filtered.total, 1);
    assert.equal(filtered.summary.all, page1.summary.all);
    const smallPage = await queryPatients(db, "", 1, {
      ...defaultPatientOptions,
      pageSize: 8,
    });
    assert.equal(smallPage.patients.length, 8);
    assert.equal(smallPage.pages, 4);
    await db.patient.update({
      where: { id: first.id },
      data: { isActive: false },
    });
    assert.equal(
      (
        await queryPatients(db, "", 1, {
          ...defaultPatientOptions,
          status: "inactive",
        })
      ).total,
      1,
    );
    assert.equal(
      (
        await queryPatients(db, "", 1, {
          ...defaultPatientOptions,
          status: "active",
        })
      ).total,
      27,
    );
    await db.patient.update({
      where: { id: first.id },
      data: { registeredAt: new Date("2026-10-19T19:00:00Z") },
    });
    assert.equal(
      (
        await queryPatients(db, "Ayesha", 1, {
          ...defaultPatientOptions,
          from: "2026-10-20",
          to: "2026-10-20",
        })
      ).total,
      1,
    );
    assert.equal(
      (
        await queryPatients(db, "Ayesha", 1, {
          ...defaultPatientOptions,
          to: "2026-10-19",
        })
      ).total,
      0,
    );
  } finally {
    await db?.$disconnect();
    await control.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
    await control.end();
  }
});
