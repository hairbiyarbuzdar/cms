import { requireRole, authErrorResponse } from "@/lib/authorization";
import { prisma } from "@/lib/prisma";
import {
  parsePatientFilters,
  parsePatientOptions,
  patientNumber,
  patientAge,
} from "@/lib/patient-validation";
import { queryPatients } from "@/services/patient-query";
import type { NextRequest } from "next/server";

function csvCell(value: string | number | null) {
  let text = String(value ?? "");
  if (/^[\s]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  try {
    await requireRole("USER", request.headers);
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const { query } = parsePatientFilters(params.q, undefined);
    const result = await queryPatients(prisma, query, 1, {
      ...parsePatientOptions(params),
      pageSize: 5000,
    });
    if (result.total > 5000)
      return Response.json(
        {
          error:
            "Export is limited to 5,000 patients. Narrow the search or date range.",
        },
        { status: 422, headers: { "Cache-Control": "private, no-store" } },
      );
    const rows = [
      [
        "Patient number",
        "Name",
        "Age",
        "Gender",
        "Phone",
        "Registered at (UTC)",
        "Status",
      ],
      ...result.patients.map((p) => [
        patientNumber(p.patientNumber),
        p.name,
        patientAge(p.dateOfBirth, p.ageAtRegistration),
        p.gender,
        p.phone,
        p.registeredAt.toISOString(),
        p.isActive ? "Active" : "Inactive",
      ]),
    ];
    return new Response(
      "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n"),
      {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="patients.csv"',
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  } catch (error) {
    return authErrorResponse(error);
  }
}
