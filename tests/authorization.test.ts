import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { hasRole } from "../src/lib/auth-roles";
import { proxy } from "../src/proxy";

test("role matrix allows admin inheritance and rejects unknown or mixed roles", () => {
  assert.equal(hasRole("ADMIN", "ADMIN"), true);
  assert.equal(hasRole("ADMIN", "USER"), true);
  assert.equal(hasRole("USER", "USER"), true);
  for (const role of ["USER", "admin", "ADMIN,USER", "", null, undefined]) {
    assert.equal(hasRole(role, "ADMIN"), false);
  }
  assert.equal(hasRole("OWNER", "USER"), false);
});

test("anonymous API and system requests are rejected without caching", () => {
  for (const path of ["/api/me", "/api/admin/users"]) {
    const response = proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response.status, 401);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
  }
});

test("anonymous page requests redirect to the login form", () => {
  for (const path of ["/dashboard", "/admin", "/patients"]) {
    const response = proxy(new NextRequest(`http://localhost:3000${path}`));
    assert.equal(response.status, 307);
    assert.equal(
      response.headers.get("location"),
      "http://localhost:3000/login",
    );
  }
});

test("authentication endpoints reach the library's own authorization checks", () => {
  for (const path of [
    "/api/auth/sign-in/email",
    "/api/auth/admin/create-user",
  ]) {
    assert.equal(
      proxy(new NextRequest(`http://localhost:3000${path}`)).headers.get(
        "x-middleware-next",
      ),
      "1",
    );
  }
});

test("a cookie only passes the optimistic gate, leaving verification to the handler", () => {
  const request = new NextRequest("http://localhost:3000/api/me", {
    headers: { cookie: "better-auth.session_token=forged" },
  });
  assert.equal(proxy(request).headers.get("x-middleware-next"), "1");
});
