export type ApiErrorBody = {
  code: string;
  message: string;
  details?: unknown;
};

export type ApiOk<T> = { data: T; error: null };
export type ApiErr = { data: null; error: ApiErrorBody };
export type ApiResponse<T> = ApiOk<T> | ApiErr;

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(message: string, code: string, status: number, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  formData?: boolean;
  /** Evita loop infinito no refresh. */
  _retry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) return false;
      const json = (await res.json()) as ApiResponse<unknown>;
      return !json.error;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, formData, headers, _retry, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: formData
      ? { ...(headers || {}) }
      : {
          "Content-Type": "application/json",
          ...(headers || {}),
        },
    body:
      body === undefined
        ? undefined
        : formData
          ? (body as BodyInit)
          : JSON.stringify(body),
  });

  // Uma tentativa de refresh em 401 (exceto nas próprias rotas de auth).
  const isAuthPath =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/forgot") ||
    path.startsWith("/auth/reset");

  if (res.status === 401 && !_retry && !isAuthPath) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return api<T>(path, { ...options, _retry: true });
    }
  }

  let json: ApiResponse<T> | null = null;
  try {
    json = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      "Resposta inválida da API",
      "INVALID_RESPONSE",
      res.status,
    );
  }

  if (!res.ok || json.error) {
    throw new ApiError(
      json.error?.message ?? "Erro na API",
      json.error?.code ?? "UNKNOWN",
      res.status,
      json.error?.details,
    );
  }

  return json.data;
}

export function getApiUrl() {
  return API_URL;
}
