import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Auth endpoints enforce their own session, CSRF, and admin permissions.
  if (request.nextUrl.pathname.startsWith("/api/auth/"))
    return NextResponse.next();

  // This is an optimistic gate only. A cookie is not proof of identity:
  // requireSession / requireRole validate it against PostgreSQL inside handlers.
  if (!getSessionCookie(request)) {
    if (!request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401, headers: { "Cache-Control": "private, no-store" } },
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/patients/:path*",
  ],
};
