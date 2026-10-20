"use client";

import { useState } from "react";
import {
  PatientDetailsModal,
  type PatientDetails,
} from "@/components/modals/patient-details-modal";

export function PatientActions({ patient }: { patient: PatientDetails }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`View ${patient.name}`}
        className="rounded-md border border-border p-2 text-muted hover:bg-surface hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      {open && (
        <PatientDetailsModal patient={patient} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
