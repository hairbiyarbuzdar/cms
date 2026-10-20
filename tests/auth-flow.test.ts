import assert from "node:assert/strict";
import { test } from "node:test";
import { betterAuth } from "better-auth";
import { memoryAdapter } from "better-auth/adapters/memory";
import { authOptions } from "../src/lib/auth-options";

test("real auth flow: signup disabled, invalid credentials, RBAC, revocation and CSRF", async () => {
  const auth = betterAuth({
    ...authOptions,
    baseURL: "http://localhost:3000",
    secret: "auth-tests-only-unique-secret-at-least-32-characters",
    database: memoryAdapter({
      user: [],
      session: [],
      account: [],
      verification: [],
      rateLimit: [],
    }),
  });
  const password = "Test-password-12345";
  const user = await auth.api.createUser({
    body: {
      email: "user@example.com",
      name: "User",
      password,
      role: "USER",
    },
  });
  await auth.api.createUser({
    body: {
      email: "admin@example.com",
      name: "Admin",
      password,
      role: "ADMIN",
    },
  });
  const request = (
    path: string,
    body?: unknown,
    cookie?: string,
    origin = "http://localhost:3000",
  ) =>
    auth.handler(
      new Request(`http://localhost:3000/api/auth${path}`, {
        method: body === undefined ? "GET" : "POST",
        headers: {
          "content-type": "application/json",
          origin,
          ...(cookie ? { cookie } : {}),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      }),
    );
  const signup = await request("/sign-up/email", {
    email: "stranger@example.com",
    name: "Stranger",
    password,
    role: "ADMIN",
  });
  assert.equal(signup.status, 400);
  assert.equal(
    (
      await request("/sign-in/email", {
        email: "user@example.com",
        password: "wrong-password-123",
      })
    ).status,
    401,
  );
  const login = await request("/sign-in/email", {
    email: "user@example.com",
    password,
  });
  assert.equal(login.status, 200);
  const cookie = login.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.ok(cookie.includes("session_token="));
  const session = await auth.api.getSession({
    headers: new Headers({ cookie }),
  });
  assert.equal(session?.user.role, "USER");
  assert.equal(
    (await request("/admin/list-users", undefined, cookie)).status,
    403,
  );
  assert.equal(
    (
      await request(
        "/admin/set-role",
        { userId: user.user.id, role: "ADMIN" },
        cookie,
      )
    ).status,
    403,
  );
  assert.equal(
    (await request("/sign-out", {}, cookie, "https://attacker.example")).status,
    403,
  );
  const adminLogin = await request("/sign-in/email", {
    email: "admin@example.com",
    password,
  });
  assert.equal(adminLogin.status, 200);
  const adminCookie = adminLogin.headers
    .getSetCookie()
    .map((value) => value.split(";")[0])
    .join("; ");
  assert.equal(
    (await request("/admin/list-users", undefined, adminCookie)).status,
    200,
  );
  assert.equal(
    (
      await request(
        "/admin/revoke-user-sessions",
        { userId: user.user.id },
        adminCookie,
      )
    ).status,
    200,
  );
  assert.equal(
    await auth.api.getSession({ headers: new Headers({ cookie }) }),
    null,
  );
  assert.equal((await request("/sign-out", {}, adminCookie)).status, 200);
  assert.equal(
    await auth.api.getSession({
      headers: new Headers({ cookie: adminCookie }),
    }),
    null,
  );
  assert.equal(
    await auth.api.getSession({
      headers: new Headers({ cookie: "better-auth.session_token=forged" }),
    }),
    null,
  );
});
