"use client";

import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PatientForm } from "@/components/forms/patient-form";
import { RegisterPatientModal } from "@/components/modals/register-patient-modal";
import { patientNumber } from "@/lib/patient-validation";

export function PatientWorkspace({
  summary,
  filters,
  list,
}: {
  summary: ReactNode;
  filters: ReactNode;
  list: ReactNode;
}) {
  const [panel, setPanel] = useState(true);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [success, setSuccess] = useState("");
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  function registered(value: number) {
    setModal(false);
    setVersion((v) => v + 1);
    setSuccess(`Patient ${patientNumber(value)} registered successfully.`);
    router.push("/patients");
    router.refresh();
  }
  function openRegistration() {
    setSuccess("");
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setPanel(true);
      requestAnimationFrame(() => ref.current?.querySelector("input")?.focus());
    } else setModal(true);
  }
  return (
    <main className="mx-auto max-w-screen-2xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-xs text-muted"
      >
        <Link href="/dashboard" className="hover:text-foreground">
          Dashboard
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-foreground">Patients</span>
      </nav>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Patients</h1>
          <p className="mt-1 text-sm text-muted">
            Manage your clinic’s patient register.
          </p>
        </div>
        <button
          type="button"
          onClick={openRegistration}
          disabled={busy}
          className="button-primary gap-2"
        >
          <svg
            aria-hidden="true"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 4v16M4 12h16" />
          </svg>
          Register patient
        </button>
      </div>
      {summary}
      {success && (
        <p role="status" className="text-sm font-medium">
          {success}
        </p>
      )}
      <div
        className={`grid items-start gap-5 ${panel ? "xl:grid-cols-[minmax(0,1fr)_21rem]" : ""}`}
      >
        <div className="min-w-0 space-y-5">
          {filters}
          {list}
        </div>
        {panel && (
          <aside
            ref={ref}
            aria-labelledby="registration-panel-title"
            className="dashboard-panel hidden xl:block"
          >
            <div className="flex items-start justify-between gap-2 border-b border-border p-4">
              <div>
                <h2
                  id="registration-panel-title"
                  className="text-base font-semibold"
                >
                  Register new patient
                </h2>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Fill in the patient details to register a new patient.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPanel(false)}
                disabled={busy}
                aria-label="Close registration panel"
                className="rounded-md p-2 text-muted hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                >
                  <path d="m6 6 12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <PatientForm
              key={version}
              autoFocus={false}
              onSuccess={registered}
              onCancel={() => setPanel(false)}
              onBusyChange={setBusy}
            />
          </aside>
        )}
      </div>
      {modal && (
        <RegisterPatientModal
          onClose={() => setModal(false)}
          onSuccess={registered}
        />
      )}
    </main>
  );
}
