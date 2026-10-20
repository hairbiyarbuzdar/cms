import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthorizationError } from "@/lib/authorization";
import { parsePeriod } from "@/lib/dashboard-period";
import { getDashboard } from "@/services/dashboard";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";

export const metadata: Metadata = { title: "Dashboard · CMS" };

async function Overview({ searchParams }: PageProps<"/dashboard">) {
  let result;
  try {
    const period = parsePeriod((await searchParams).period);
    result = await getDashboard(period);
  } catch (error) {
    if (error instanceof AuthorizationError) redirect("/login");
    throw error;
  }
  return <DashboardOverview data={result.data} name={result.user.name} />;
}

export default function DashboardPage(props: PageProps<"/dashboard">) {
  return (
    <Suspense
      fallback={
        <main className="min-h-dvh bg-surface px-6 py-12">
          <p role="status" className="mx-auto max-w-7xl text-muted">
            Loading your clinic overview…
          </p>
        </main>
      }
    >
      <Overview {...props} />
    </Suspense>
  );
}
