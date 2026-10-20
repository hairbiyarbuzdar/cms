import "server-only";
import { requireRole } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import type { Period } from "@/lib/dashboard-period";
import { queryDashboard } from "./dashboard-query";

export async function getDashboard(period: Period) {
  const { user } = await requireRole("USER");
  const data = await queryDashboard(prisma, period);
  return { user, data };
}
