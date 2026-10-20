import "server-only";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import { queryPatients } from "./patient-query";
import type { PatientOptions } from "@/lib/patient-validation";

export async function getPatients(
  query: string,
  page: number,
  options?: PatientOptions,
) {
  const { user } = await requireRole("USER");
  return { user, list: await queryPatients(prisma, query, page, options) };
}
