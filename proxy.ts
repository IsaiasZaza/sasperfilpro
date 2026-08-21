import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookie";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  if (token) return NextResponse.next();

  const login = new URL("/login", request.url);
  const next = request.nextUrl.pathname + request.nextUrl.search;
  if (next.startsWith("/")) login.searchParams.set("next", next);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/app",
    "/app/:path*",
    "/onboarding",
    "/onboarding/:path*",
    "/assinatura",
    "/assinatura/:path*",
  ],
};
