"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { setPatientStatus } from "@/app/patients/actions";

export type PatientDetails = {
  id: string;
  name: string;
  number: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
  address: string | null;
  externalId: string | null;
  notes: string | null;
  isActive: boolean;
};
export function PatientDetailsModal({
  patient,
  onClose,
}: {
  patient: PatientDetails;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  async function toggleStatus() {
    setBusy(true);
    setError("");
    try {
      const result = await setPatientStatus(patient.id, !patient.isActive);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Unable to change patient status. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={patient.name}
      description={patient.number}
      busy={busy}
      onClose={onClose}
    >
      <div className="space-y-5 p-6">
        <dl className="grid grid-cols-2 gap-5 text-sm">
          {[
            ["Age", patient.age === null ? null : String(patient.age)],
            ["Gender", patient.gender],
            ["Phone", patient.phone],
            ["Status", patient.isActive ? "Active" : "Inactive"],
            ["CNIC / external ID", patient.externalId],
            ["Address", patient.address],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="mt-1 break-words">{value || "Not provided"}</dd>
            </div>
          ))}
        </dl>
        <div>
          <h3 className="text-sm font-medium">Notes</h3>
          <p className="mt-2 text-sm leading-6 whitespace-pre-wrap text-muted">
            {patient.notes || "No notes recorded."}
          </p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
        <button
          type="button"
          className="button-secondary"
          disabled={busy}
          onClick={toggleStatus}
        >
          {busy
            ? "Updating…"
            : patient.isActive
              ? "Mark inactive"
              : "Mark active"}
        </button>
      </div>
    </Dialog>
  );
}
