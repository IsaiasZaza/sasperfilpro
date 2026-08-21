import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookie";

export { ACCESS_TOKEN_COOKIE };

const STORAGE_KEY = "pp_access_token";

let memoryToken: string | null = null;

export function getAccessToken() {
  if (memoryToken) return memoryToken;
  if (typeof window === "undefined") return null;
  try {
    memoryToken = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    memoryToken = null;
  }
  return memoryToken;
}

export function setAccessToken(accessToken: string | null) {
  memoryToken = accessToken;
  if (typeof window === "undefined") return;
  try {
    if (accessToken) sessionStorage.setItem(STORAGE_KEY, accessToken);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function persistSessionCookie(accessToken: string) {
  if (!accessToken) return;
  setAccessToken(accessToken);
  const res = await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken }),
  });
  if (!res.ok) {
    throw new Error("Não foi possível gravar a sessão.");
  }
}

export async function clearSessionCookie() {
  setAccessToken(null);
  try {
    await fetch("/api/session", { method: "DELETE" });
  } catch {
    // ignore
  }
}
