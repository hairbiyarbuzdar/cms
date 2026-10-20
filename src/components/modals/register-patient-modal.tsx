"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { PatientForm } from "@/components/forms/patient-form";

export function RegisterPatientModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (number: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      title="Register patient"
      description="Create a patient record for your clinic."
      busy={busy}
      onClose={onClose}
    >
      <PatientForm
        onSuccess={onSuccess}
        onCancel={onClose}
        onBusyChange={setBusy}
      />
    </Dialog>
  );
}
