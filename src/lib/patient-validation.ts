import { z } from "zod";

export const patientSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter a full name with at least 2 characters.")
    .max(120, "Use 120 characters or fewer."),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine(
      (value) =>
        !value ||
        (/^\+?[\d\s()-]+$/.test(value) &&
          value.replace(/\D/g, "").length >= 7 &&
          value.replace(/\D/g, "").length <= 15),
      "Enter a valid phone number with 7–15 digits.",
    ),
  dateOfBirth: z.string().refine((value) => {
    if (!value) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const date = new Date(`${value}T00:00:00Z`);
    const today = new Date(Date.now() + 5 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value &&
      value >= "1900-01-01" &&
      value <= today
    );
  }, "Enter a valid birth date between 1900 and today."),
  gender: z.enum(["", "Female", "Male", "Other"]),
  address: z.string().trim().max(300, "Use 300 characters or fewer."),
  registrationKey: z.uuid(),
  ageAtRegistration: z
    .string()
    .default("")
    .refine(
      (value) =>
        value === "" || (/^\d{1,3}$/.test(value) && Number(value) <= 130),
      "Enter an age from 0 to 130.",
    ),
  externalId: z
    .string()
    .trim()
    .max(40, "Use 40 characters or fewer.")
    .default(""),
  notes: z
    .string()
    .trim()
    .max(2000, "Use 2,000 characters or fewer.")
    .default(""),
});

export type PatientInput = z.infer<typeof patientSchema>;
export type PatientFieldErrors = Partial<Record<keyof PatientInput, string[]>>;

export function patientNumber(value: number) {
  return `PT-${String(value).padStart(6, "0")}`;
}

export function parsePatientFilters(
  search: string | string[] | undefined,
  page: string | string[] | undefined,
) {
  const query = typeof search === "string" ? search.trim().slice(0, 120) : "";
  const parsed =
    typeof page === "string" && /^\d{1,6}$/.test(page) ? Number(page) : 1;
  return { query, page: Math.max(1, parsed) };
}

export type PatientOptions = {
  gender: string;
  status: string;
  from: string;
  to: string;
  pageSize: number;
};
export const defaultPatientOptions: PatientOptions = {
  gender: "",
  status: "",
  from: "",
  to: "",
  pageSize: 25,
};
export function parsePatientOptions(
  params: Record<string, string | string[] | undefined>,
): PatientOptions {
  const value = (key: string) =>
    typeof params[key] === "string" ? (params[key] as string) : "";
  const date = (key: string) => {
    const input = value(key);
    return /^\d{4}-\d{2}-\d{2}$/.test(input) &&
      Number.isFinite(Date.parse(input)) &&
      new Date(input).toISOString().slice(0, 10) === input
      ? input
      : "";
  };
  return {
    gender: ["Female", "Male", "Other"].includes(value("gender"))
      ? value("gender")
      : "",
    status: ["active", "inactive"].includes(value("status"))
      ? value("status")
      : "",
    from: date("from"),
    to: date("to"),
    pageSize: [8, 25, 50].includes(Number(value("size")))
      ? Number(value("size"))
      : 8,
  };
}

export function patientListUrl(
  query: string,
  page: number,
  options: PatientOptions,
) {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    size: String(options.pageSize),
    gender: options.gender,
    status: options.status,
    from: options.from,
    to: options.to,
  });
  return `/patients?${params}`;
}

export function patientAge(
  dateOfBirth: Date | null,
  ageAtRegistration: number | null,
  now = new Date(),
) {
  if (!dateOfBirth) return ageAtRegistration;
  let age = now.getUTCFullYear() - dateOfBirth.getUTCFullYear();
  if (
    now.getUTCMonth() < dateOfBirth.getUTCMonth() ||
    (now.getUTCMonth() === dateOfBirth.getUTCMonth() &&
      now.getUTCDate() < dateOfBirth.getUTCDate())
  )
    age--;
  return age;
}
