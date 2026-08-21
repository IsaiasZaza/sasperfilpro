const KEY = "perfilpro:claimed-username";

export function saveClaimedUsername(username: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, username);
}

export function readClaimedUsername() {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(KEY) ?? "";
}
