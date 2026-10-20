import Link from "next/link";
import type { PatientList } from "@/services/patient-query";

export function PatientFilters({ list }: { list: PatientList }) {
  const o = list.options;
  return (
    <form
      key={JSON.stringify([list.query, list.options])}
      action="/patients"
      className="dashboard-panel space-y-4 p-4"
    >
      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="patient-search">
          Search patients
        </label>
        <input
          id="patient-search"
          name="q"
          type="search"
          defaultValue={list.query}
          className="form-input min-w-0 flex-1 basis-52"
          placeholder="Search by name, phone, or patient number…"
          maxLength={120}
        />
        <button type="submit" className="button-primary">
          Search
        </button>
        <Link href="/patients" className="button-secondary">
          Clear
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <div>
          <label className="form-label" htmlFor="gender-filter">
            Gender
          </label>
          <select
            id="gender-filter"
            name="gender"
            defaultValue={o.gender}
            className="form-input"
          >
            <option value="">All genders</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="form-label" htmlFor="from-filter">
            Registered from
          </label>
          <input
            id="from-filter"
            name="from"
            type="date"
            defaultValue={o.from}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="to-filter">
            Registered to
          </label>
          <input
            id="to-filter"
            name="to"
            type="date"
            defaultValue={o.to}
            min={o.from || undefined}
            className="form-input"
          />
        </div>
        <div>
          <label className="form-label" htmlFor="status-filter">
            Patient status
          </label>
          <select
            id="status-filter"
            name="status"
            defaultValue={o.status}
            className="form-input"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>
      <input type="hidden" name="size" value={o.pageSize} />
    </form>
  );
}
