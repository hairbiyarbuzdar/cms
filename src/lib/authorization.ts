import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { hasRole, type Role } from "@/lib/auth-roles";

export class AuthorizationError extends Error {
  constructor(public readonly status: 401 | 403) {
    super(status === 401 ? "Authentication required" : "Access denied");
  }
}

// Call at the start of every protected Server Action, handler, or data operation.
// No shared cache: revocation and role changes must take effect immediately.
export async function requireSession(requestHeaders?: Headers) {
  const session = await auth.api.getSession({
    headers: requestHeaders ?? (await headers()),
    query: { disableCookieCache: true },
  });
  if (!session || session.user.banned) throw new AuthorizationError(401);
  return session;
}

export async function requireRole(role: Role, requestHeaders?: Headers) {
  const session = await requireSession(requestHeaders);
  if (!hasRole(session.user.role, role)) throw new AuthorizationError(403);
  return session;
}

export function authErrorResponse(error: unknown) {
  const status = error instanceof AuthorizationError ? error.status : 503;
  return Response.json(
    {
      error:
        status === 503
          ? "Authentication service unavailable"
          : (error as Error).message,
    },
    { status, headers: { "Cache-Control": "private, no-store" } },
  );
}
