import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export const metadata: Metadata = { title: "Sign in · CMS" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col bg-surface px-6 py-8 sm:px-12">
      <Link href="/" className="w-fit text-xl font-semibold tracking-tight">
        cms<span className="text-muted">.</span>
      </Link>
      <div className="flex flex-1 items-center justify-center py-12">
        <section className="w-full max-w-sm" aria-labelledby="login-heading">
          <h1
            id="login-heading"
            className="text-3xl font-semibold tracking-tight"
          >
            Welcome back
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Sign in to your CMS workspace.
          </p>
          <LoginForm />
          <p className="mt-8 border-t border-border pt-6 text-sm leading-6 text-muted">
            Need an account? Contact your administrator.
          </p>
        </section>
      </div>
      <footer className="text-xs text-muted">CMS workspace</footer>
    </main>
  );
}
