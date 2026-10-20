"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email")).trim(),
        password: String(data.get("password")),
      });
      if (result.error) {
        setError(
          result.error.status === 401
            ? "The email or password is incorrect. Please try again."
            : result.error.status === 429
              ? "Too many attempts. Wait a moment and try again."
              : "We couldn’t sign you in. Please try again shortly.",
        );
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="mt-8 space-y-5" aria-busy={pending}>
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          required
          maxLength={254}
          className="form-input"
          disabled={pending}
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
            required
            maxLength={128}
            className="form-input pr-20"
            disabled={pending}
            aria-describedby={error ? "login-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 px-4 text-xs font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {visible ? "Hide" : "Show"}
          </button>
        </div>
      </div>
      {error && (
        <p
          id="login-error"
          role="alert"
          className="text-sm leading-6 text-danger"
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="button-primary w-full"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
