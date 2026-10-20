import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthorizationError } from "@/lib/authorization";
import {
  parsePatientFilters,
  parsePatientOptions,
} from "@/lib/patient-validation";
import { getPatients } from "@/services/patients";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { PatientList } from "@/components/patients/patient-list";
import { PatientSummary } from "@/components/patients/patient-summary";
import { PatientFilters } from "@/components/patients/patient-filters";
import { PatientWorkspace } from "@/components/patients/patient-workspace";
export const metadata: Metadata = { title: "Patients · CMS" };
async function Patients({ searchParams }: PageProps<"/patients">) {
  let result;
  try {
    const params = await searchParams;
    const filters = parsePatientFilters(params.q, params.page);
    result = await getPatients(
      filters.query,
      filters.page,
      parsePatientOptions(params),
    );
  } catch (error) {
    if (error instanceof AuthorizationError) redirect("/login");
    throw error;
  }
  return (
    <WorkspaceShell name={result.user.name} active="patients">
      <PatientWorkspace
        summary={<PatientSummary summary={result.list.summary} />}
        filters={<PatientFilters list={result.list} />}
        list={<PatientList list={result.list} />}
      />
    </WorkspaceShell>
  );
}
export default function PatientsPage(props: PageProps<"/patients">) {
  return (
    <Suspense
      fallback={
        <p role="status" className="p-8 text-muted">
          Loading patients…
        </p>
      }
    >
      <Patients {...props} />
    </Suspense>
  );
}
