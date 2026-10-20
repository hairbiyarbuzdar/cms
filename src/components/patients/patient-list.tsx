import Link from "next/link";
import {
  patientNumber,
  patientAge,
  patientListUrl,
} from "@/lib/patient-validation";
import { reportingTimeZone } from "@/lib/dashboard-period";
import type { PatientList as List } from "@/services/patient-query";
import { PatientActions } from "./patient-actions";
import { RowsPerPage } from "./rows-per-page";

export function PatientList({ list }: { list: List }) {
  const pageUrl = (page: number) =>
    patientListUrl(list.query, page, list.options);
  const date = (value: Date) =>
    new Intl.DateTimeFormat("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: reportingTimeZone,
    }).format(value);
  const time = (value: Date) =>
    new Intl.DateTimeFormat("en-PK", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: reportingTimeZone,
    }).format(value);
  const filtered = Boolean(
    list.query ||
    list.options.gender ||
    list.options.status ||
    list.options.from ||
    list.options.to,
  );
  const pageNumbers = [
    ...new Set([1, list.page - 1, list.page, list.page + 1, list.pages]),
  ]
    .filter((p) => p >= 1 && p <= list.pages)
    .sort((a, b) => a - b);
  const exportUrl = `/api/patients/export?${new URLSearchParams({ q: list.query, ...Object.fromEntries(Object.entries(list.options).map(([k, v]) => [k, String(v)])) })}`;
  return (
    <section className="dashboard-panel" aria-labelledby="patient-list-heading">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
        <h2 id="patient-list-heading" className="text-base font-semibold">
          Patients{" "}
          <span className="text-muted">
            ({list.total.toLocaleString("en-PK")})
          </span>
        </h2>
        <a
          href={exportUrl}
          className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary"
        >
          <svg
            aria-hidden="true"
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
          </svg>
          Export CSV
        </a>
      </div>
      {list.patients.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">
              Registered patients, newest first. Page {list.page} of{" "}
              {list.pages}. Ages without a birth date are as recorded at
              registration.
            </caption>
            <thead className="border-b border-border bg-surface text-muted">
              <tr>
                {[
                  "#",
                  "Patient",
                  "Age",
                  "Gender",
                  "Phone",
                  "Registration date",
                  "Status",
                  "Actions",
                ].map((label) => (
                  <th
                    key={label}
                    scope="col"
                    className="px-3 py-3 font-medium whitespace-nowrap"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.patients.map((patient, index) => {
                const age = patientAge(
                  patient.dateOfBirth,
                  patient.ageAtRegistration,
                );
                const number = patientNumber(patient.patientNumber);
                const initials = patient.name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => Array.from(part)[0])
                  .join("")
                  .toUpperCase();
                return (
                  <tr key={patient.id} className="hover:bg-surface">
                    <td className="px-3 py-3 text-muted">
                      {(list.page - 1) * list.options.pageSize + index + 1}
                    </td>
                    <th scope="row" className="min-w-40 px-3 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-xs text-muted"
                        >
                          {initials}
                        </span>
                        <div className="min-w-0">
                          <span className="block break-words">
                            {patient.name}
                          </span>
                          <span className="mt-1 block text-xs font-normal text-muted">
                            {number}
                          </span>
                        </div>
                      </div>
                    </th>
                    <td
                      className="px-3 py-3 tabular-nums"
                      title={
                        patient.dateOfBirth
                          ? "Calculated from date of birth"
                          : "Age at registration"
                      }
                    >
                      {age ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      {patient.gender ? (
                        <span className="rounded bg-surface px-2 py-1 text-xs">
                          {patient.gender}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {patient.phone || "—"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="block">
                        {date(patient.registeredAt)}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {time(patient.registeredAt)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ${patient.isActive ? "bg-status-active text-status-active-foreground" : "bg-surface text-muted"}`}
                      >
                        <span
                          aria-hidden="true"
                          className="h-1 w-1 rounded-full bg-current"
                        />
                        {patient.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <PatientActions
                        patient={{
                          id: patient.id,
                          name: patient.name,
                          number,
                          age,
                          phone: patient.phone,
                          gender: patient.gender,
                          externalId: patient.externalId,
                          notes: patient.notes,
                          address: patient.address,
                          isActive: patient.isActive,
                        }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-16 text-center">
          <h3 className="font-medium">
            {filtered ? "No matching patients" : "No patients registered yet"}
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {filtered
              ? "Try another search or adjust the filters."
              : "Use the registration panel to add your first patient."}
          </p>
          {filtered && (
            <Link
              href="/patients"
              className="mt-4 inline-block text-sm underline underline-offset-4"
            >
              Clear filters
            </Link>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-4 py-4">
        <p className="text-xs text-muted">
          {list.total
            ? `Showing ${(list.page - 1) * list.options.pageSize + 1} to ${Math.min(list.page * list.options.pageSize, list.total)} of ${list.total} patients`
            : "0 patients"}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <nav
            aria-label="Patient list pages"
            className="flex items-center gap-1 text-xs"
          >
            {list.page > 1 && (
              <Link
                href={pageUrl(list.page - 1)}
                aria-label="Previous page"
                className="rounded-md border border-border px-2 py-2 hover:bg-surface"
              >
                Previous
              </Link>
            )}
            {pageNumbers.map((page, index) => (
              <span key={page} className="inline-flex items-center gap-1">
                {index > 0 && page > pageNumbers[index - 1] + 1 && (
                  <span className="px-1 text-muted">…</span>
                )}
                <Link
                  href={pageUrl(page)}
                  aria-current={list.page === page ? "page" : undefined}
                  aria-label={`Page ${page}`}
                  className={`min-w-8 rounded-md px-2 py-2 text-center ${page === list.page ? "bg-primary text-primary-foreground" : "hover:bg-surface"}`}
                >
                  {page}
                </Link>
              </span>
            ))}
            {list.page < list.pages && (
              <Link
                href={pageUrl(list.page + 1)}
                aria-label="Next page"
                className="rounded-md border border-border px-2 py-2 hover:bg-surface"
              >
                Next
              </Link>
            )}
          </nav>
          <RowsPerPage query={list.query} options={list.options} />
        </div>
      </div>
    </section>
  );
}
