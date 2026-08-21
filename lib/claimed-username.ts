const KEY = "perfilpro:claimed-username";
const EMAIL_KEY = "perfilpro:pending-email";

export function saveClaimedUsername(username: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, username);
}

export function readClaimedUsername() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(KEY) ?? "";
}

export function savePendingEmail(email: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(EMAIL_KEY, email.trim());
}

export function readPendingEmail() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(EMAIL_KEY) ?? "";
}

export function clearPendingEmail() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(EMAIL_KEY);
}
