"use client";

import { useRouter } from "next/navigation";
import { patientListUrl, type PatientOptions } from "@/lib/patient-validation";

export function RowsPerPage({
  query,
  options,
}: {
  query: string;
  options: PatientOptions;
}) {
  const router = useRouter();
  return (
    <select
      aria-label="Patients per page"
      value={options.pageSize}
      onChange={(event) =>
        router.push(
          patientListUrl(query, 1, {
            ...options,
            pageSize: Number(event.target.value),
          }),
        )
      }
      className="rounded-md border border-border bg-background px-2 py-2 text-xs focus-visible:outline-2 focus-visible:outline-primary"
    >
      {[8, 25, 50].map((size) => (
        <option key={size} value={size}>
          {size} / page
        </option>
      ))}
    </select>
  );
}
