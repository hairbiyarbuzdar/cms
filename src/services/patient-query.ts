import { Prisma, type PrismaClient } from "../generated/prisma/client";
import {
  defaultPatientOptions,
  type PatientInput,
  type PatientOptions,
} from "../lib/patient-validation";

export const patientPageSize = 25;
const selection = {
  id: true,
  patientNumber: true,
  name: true,
  phone: true,
  dateOfBirth: true,
  gender: true,
  address: true,
  registeredAt: true,
  ageAtRegistration: true,
  externalId: true,
  notes: true,
  isActive: true,
} satisfies Prisma.PatientSelect;

export async function queryPatients(
  db: PrismaClient,
  query: string,
  requestedPage: number,
  options: PatientOptions = defaultPatientOptions,
) {
  const numeric = /^(?:PT-)?0*(\d+)$/i.exec(query);
  const candidate = numeric ? Number(numeric[1]) : undefined;
  const patientNumber =
    candidate && candidate <= 2147483647 ? candidate : undefined;
  const where: Prisma.PatientWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { phone: { contains: query } },
          ...(patientNumber ? [{ patientNumber }] : []),
        ],
      }
    : {};
  if (options.gender) where.gender = options.gender;
  if (options.status) where.isActive = options.status === "active";
  if (options.from || options.to)
    where.registeredAt = {
      ...(options.from
        ? { gte: new Date(`${options.from}T00:00:00+05:00`) }
        : {}),
      ...(options.to
        ? {
            lt: new Date(
              new Date(`${options.to}T00:00:00+05:00`).getTime() + 86400000,
            ),
          }
        : {}),
    };
  return db.$transaction(
    async (tx) => {
      const total = await tx.patient.count({ where });
      const pages = Math.max(1, Math.ceil(total / options.pageSize));
      const page = Math.min(requestedPage, pages);
      const patients = await tx.patient.findMany({
        where,
        select: selection,
        orderBy: [{ registeredAt: "desc" }, { patientNumber: "desc" }],
        skip: (page - 1) * options.pageSize,
        take: options.pageSize,
      });
      const now = new Date();
      const local = new Date(now.getTime() + 5 * 3600000);
      const today = new Date(
        Date.UTC(
          local.getUTCFullYear(),
          local.getUTCMonth(),
          local.getUTCDate(),
        ) -
          5 * 3600000,
      );
      const week = new Date(
        today.getTime() - ((local.getUTCDay() + 6) % 7) * 86400000,
      );
      const month = new Date(
        Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1) - 5 * 3600000,
      );
      const [all, daily, weekly, monthly] = await Promise.all([
        tx.patient.count({ where: { registeredAt: { lte: now } } }),
        tx.patient.count({ where: { registeredAt: { gte: today, lte: now } } }),
        tx.patient.count({ where: { registeredAt: { gte: week, lte: now } } }),
        tx.patient.count({ where: { registeredAt: { gte: month, lte: now } } }),
      ]);
      return {
        patients,
        total,
        page,
        pages,
        query,
        options,
        summary: { all, daily, weekly, monthly },
      };
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}

export async function insertPatient(db: PrismaClient, input: PatientInput) {
  // A modal submission has a stable key, preventing duplicates after retries.
  try {
    return await db.patient.upsert({
      where: { registrationKey: input.registrationKey },
      update: {},
      create: {
        ...input,
        phone: input.phone || null,
        dateOfBirth: input.dateOfBirth
          ? new Date(`${input.dateOfBirth}T00:00:00Z`)
          : null,
        gender: input.gender || null,
        address: input.address || null,
        ageAtRegistration:
          input.ageAtRegistration === ""
            ? null
            : Number(input.ageAtRegistration),
        externalId: input.externalId || null,
        notes: input.notes || null,
      },
      select: selection,
    });
  } catch (error) {
    // Prisma may emulate this upsert with a read followed by an insert.
    // A concurrent retry can win the insert; return its existing record.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const existing = await db.patient.findUnique({
        where: { registrationKey: input.registrationKey },
        select: selection,
      });
      if (existing) return existing;
    }
    throw error;
  }
}

export type PatientList = Awaited<ReturnType<typeof queryPatients>>;
