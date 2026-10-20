export const reportingTimeZone = "Asia/Karachi";
export const periods = [7, 30, 90] as const;
export type Period = (typeof periods)[number];

export function parsePeriod(value: string | string[] | undefined): Period {
  return value === "7" ? 7 : value === "90" ? 90 : 30;
}

export function getReportingWindow(period: Period, now = new Date()) {
  // Karachi is UTC+05:00 year round. Include today and the preceding N-1 local dates.
  const local = new Date(now.getTime() + 5 * 60 * 60 * 1000);
  const start = new Date(
    Date.UTC(
      local.getUTCFullYear(),
      local.getUTCMonth(),
      local.getUTCDate() - period + 1,
    ) -
      5 * 60 * 60 * 1000,
  );
  return { start, end: now };
}

export function money(value: string | number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export function number(value: number) {
  return new Intl.NumberFormat("en-PK").format(value);
}
