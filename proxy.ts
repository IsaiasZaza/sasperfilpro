import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE = "pp_access_token";

export function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE)?.value;
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
