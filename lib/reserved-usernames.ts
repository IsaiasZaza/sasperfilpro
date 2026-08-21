export const RESERVED_USERNAMES = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "cadastro",
  "editor",
  "faq",
  "login",
  "onboarding",
  "perfilpro",
  "recuperar-senha",
  "redefinir-senha",
  "u",
  "www",
]);

export function normalizeUsername(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "")
    .replace(/-+/g, "-")
    .slice(0, 30);
}

export function isValidUsername(username: string) {
  return (
    username.length >= 3 &&
    username.length <= 30 &&
    /^[a-z0-9]+(?:[-_][a-z0-9]+)*$/.test(username) &&
    !RESERVED_USERNAMES.has(username)
  );
}
