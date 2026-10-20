"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { registerPatient } from "@/app/patients/actions";
import {
  patientSchema,
  type PatientFieldErrors,
} from "@/lib/patient-validation";

export function PatientForm({
  onSuccess,
  onCancel,
  onBusyChange,
  autoFocus = true,
}: {
  onSuccess: (number: number) => void;
  onCancel: () => void;
  onBusyChange: (value: boolean) => void;
  autoFocus?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState<PatientFieldErrors>({});
  const [key] = useState(() => crypto.randomUUID());
  const prefix = useId();
  const form = useRef<HTMLFormElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const [today] = useState(() =>
    new Date(Date.now() + 5 * 3600000).toISOString().slice(0, 10),
  );
  const id = (field: string) => `${prefix}-${field}`;
  const invalid = (field: keyof PatientFieldErrors) => ({
    "aria-invalid": Boolean(fields[field]),
    "aria-describedby": fields[field] ? id(`${field}-error`) : undefined,
  });
  const fieldError = (field: keyof PatientFieldErrors) =>
    fields[field] && (
      <p id={id(`${field}-error`)} className="mt-1 text-xs text-danger">
        {fields[field]?.[0]}
      </p>
    );
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError("");
    setFields({});
    const input = {
      ...Object.fromEntries(new FormData(event.currentTarget)),
      registrationKey: key,
    };
    const parsed = patientSchema.safeParse(input);
    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      setFields(errors);
      (
        form.current?.elements.namedItem(
          Object.keys(errors)[0],
        ) as HTMLElement | null
      )?.focus();
      return;
    }
    setPending(true);
    onBusyChange(true);
    try {
      const result = await registerPatient(parsed.data);
      if (result.success) {
        onSuccess(result.patientNumber);
        return;
      }
      setError(result.error);
      setFields(result.fields ?? {});
      requestAnimationFrame(() => errorRef.current?.focus());
    } catch {
      setError(
        "Connection interrupted. Try again; retrying this form won’t create a duplicate registration.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      setPending(false);
      onBusyChange(false);
    }
  }
  return (
    <form
      ref={form}
      onSubmit={submit}
      noValidate
      className="patient-registration-form p-4"
    >
      <fieldset disabled={pending} className="space-y-4">
        <legend className="mb-4 text-sm font-semibold">
          Personal information
        </legend>
        <div>
          <label htmlFor={id("name")} className="form-label">
            Full name <span className="text-danger">*</span>
          </label>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            autoFocus={autoFocus}
            maxLength={120}
            required
            placeholder="Enter full name"
            className="form-input"
            {...invalid("name")}
          />
          {fieldError("name")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={id("age")} className="form-label">
              Age
            </label>
            <input
              id={id("age")}
              name="ageAtRegistration"
              type="number"
              min="0"
              max="130"
              step="1"
              placeholder="Age"
              className="form-input"
              {...invalid("ageAtRegistration")}
            />
            {fieldError("ageAtRegistration")}
          </div>
          <div>
            <label htmlFor={id("gender")} className="form-label">
              Gender
            </label>
            <select
              id={id("gender")}
              name="gender"
              defaultValue=""
              className="form-input"
              {...invalid("gender")}
            >
              <option value="">Select gender</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
            {fieldError("gender")}
          </div>
        </div>
        <div>
          <label htmlFor={id("phone")} className="form-label">
            Phone number
          </label>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder="Enter phone number"
            className="form-input"
            {...invalid("phone")}
          />
          {fieldError("phone")}
        </div>
        <div>
          <label htmlFor={id("external")} className="form-label">
            CNIC / external patient ID
          </label>
          <input
            id={id("external")}
            name="externalId"
            maxLength={40}
            placeholder="Optional identifier"
            className="form-input"
            {...invalid("externalId")}
          />
          {fieldError("externalId")}
        </div>
        <div>
          <label htmlFor={id("address")} className="form-label">
            Address
          </label>
          <input
            id={id("address")}
            name="address"
            autoComplete="street-address"
            maxLength={300}
            placeholder="Enter address (optional)"
            className="form-input"
            {...invalid("address")}
          />
          {fieldError("address")}
        </div>
        <details>
          <summary className="cursor-pointer text-xs text-muted focus-visible:outline-2 focus-visible:outline-primary">
            Add date of birth (optional)
          </summary>
          <div className="mt-3">
            <label htmlFor={id("dob")} className="form-label">
              Date of birth
            </label>
            <input
              id={id("dob")}
              name="dateOfBirth"
              type="date"
              min="1900-01-01"
              max={today}
              className="form-input"
              {...invalid("dateOfBirth")}
            />
            {fieldError("dateOfBirth")}
          </div>
        </details>
        <div className="border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold">Additional information</h3>
          <label htmlFor={id("notes")} className="form-label">
            Notes
          </label>
          <textarea
            id={id("notes")}
            name="notes"
            maxLength={2000}
            rows={3}
            placeholder="Additional notes (optional)"
            className="form-input resize-y"
            {...invalid("notes")}
          />
          {fieldError("notes")}
        </div>
        <p className="text-xs leading-5 text-muted">
          Only full name is required. Age is recorded as provided at
          registration; birth date is used when available.
        </p>
      </fieldset>
      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mt-4 text-sm leading-6 text-danger"
        >
          {error}
        </p>
      )}
      <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="button-secondary"
        >
          Cancel
        </button>
        <button type="submit" disabled={pending} className="button-primary">
          {pending ? "Registering…" : "Register patient"}
        </button>
      </div>
    </form>
  );
}
