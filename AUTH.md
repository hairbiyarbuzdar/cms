# Authentication and authorization

Email/password authentication uses Better Auth and PostgreSQL-backed sessions.
Public signup is disabled. ADMIN accounts manage users; USER accounts can access
ordinary authenticated resources. Unknown roles are denied.

## Activate

1. Start PostgreSQL (`npm.cmd run db:up` if Docker Desktop is installed).
2. Set DATABASE_URL and BETTER_AUTH_URL in `.env`. For production, use the exact
   HTTPS application origin. Set BETTER_AUTH_SECRET to at least 32 random characters;
   the local setup already generated a private development secret.
3. Run `npm.cmd run db:deploy` to apply the committed auth migration.
4. Set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD in your shell, then run
   `npm.cmd run auth:create-admin`. The password must have 12–128 characters.
   Remove these bootstrap variables afterward. The command refuses to run once an
   ADMIN exists and never resets an existing user's password or role.

## Use from a client component

```ts
import { authClient } from "@/lib/auth-client";

await authClient.signIn.email({ email, password });
await authClient.signOut();

// Authenticated ADMIN only:
await authClient.admin.createUser({ name, email, password, role: "USER" });
await authClient.admin.setRole({ userId, role: "ADMIN" });
await authClient.admin.revokeUserSessions({ userId });
```

The library's HTTP endpoints are mounted at `/api/auth/*`. Passwords are hashed,
session cookies are HttpOnly, production cookies use Secure, and the library
enforces origin/CSRF protection. Database-backed rate limits apply to auth requests.
Configure your hosting proxy to provide trustworthy client IP headers.

## Protected resources

- `GET /api/me`: USER or ADMIN; returns only public user profile fields.
- `GET /api/admin/users`: ADMIN only; returns up to 100 user profiles.
- Other account management operations use `/api/auth/admin/*` and the library's
  admin permission checks.

`src/proxy.ts` provides an optimistic cookie gate for `/api/*`, `/dashboard/*`,
and `/admin/*`, excluding auth endpoints which authenticate independently.
It returns JSON 401 for missing API cookies and redirects anonymous page requests
to `/login`. **Cookie presence is not authentication.**
Every protected handler and Server Action must call `requireSession()` or
`requireRole("ADMIN")` before accessing data, including when adding future pages
under these paths. Server Components can use the same guards inside a Suspense
boundary with Cache Components enabled. Catch `AuthorizationError` and handle
401 (no valid session) or 403 (insufficient permissions) in the consuming UI.

```ts
import { requireRole } from "@/lib/authorization";

export async function updateRecord() {
  "use server";
  const { user } = await requireRole("ADMIN");
  // Authorize record ownership/scope here before accessing application data.
}
```

Session guards consult the database rather than cached role claims. Expired,
revoked, or banned sessions cannot access protected resources; database failures
fail closed (503). Never put these guards or their results in a shared cache.
Never trust user IDs, roles, or permissions supplied by the client.

The `/login` form signs users in and opens the protected `/dashboard`, which includes
sign-out. Email verification and password recovery require an email
provider and are not enabled yet.

## Verify

`npm.cmd run test:auth` checks the role matrix and optimistic request gate.
After connecting PostgreSQL, verify sign-in, USER → admin denial (403), ADMIN
access (200), sign-out/revocation (401), and disabled signup through the endpoints.
