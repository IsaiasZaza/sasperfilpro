import { NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookie";

const MAX_AGE = 60 * 60 * 24 * 7;

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  };
}

export async function POST(request: Request) {
  let accessToken = "";
  try {
    const body = (await request.json()) as { accessToken?: unknown };
    accessToken =
      typeof body.accessToken === "string" ? body.accessToken.trim() : "";
  } catch {
    accessToken = "";
  }

  if (!accessToken) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions());
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_TOKEN_COOKIE, "", {
    ...cookieOptions(),
    maxAge: 0,
  });
  return response;
}
