import { getAccessToken, setAccessToken } from "@/lib/session";

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

export function isSubscriptionRequired(err: unknown) {
  const error = err as { status?: number; code?: string };
  return error.status === 402 || error.code === "SUBSCRIPTION_REQUIRED";
}

export function fieldErrorsFromDetails(details: unknown): Record<string, string> {
  if (!Array.isArray(details)) return {};
  const out: Record<string, string> = {};
  for (const item of details) {
    if (!item || typeof item !== "object") continue;
    const field = "field" in item ? String((item as { field: unknown }).field) : "";
    const message =
      "message" in item ? String((item as { message: unknown }).message) : "";
    if (field && message) out[field] = message;
  }
  return out;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";

type ApiOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  formData?: boolean;
  /** Evita loop infinito no refresh. */
  _retry?: boolean;
};

let refreshPromise: Promise<"ok" | "expired" | "subscription"> | null = null;
let subscriptionRequiredHandler: (() => void) | null = null;

export function setSubscriptionRequiredHandler(handler: (() => void) | null) {
  subscriptionRequiredHandler = handler;
}

function shouldNotifySubscriptionRequired(path: string) {
  return !(
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/billing/checkout") ||
    path.startsWith("/billing/confirm-session") ||
    path.startsWith("/billing/plans")
  );
}

function notifySubscriptionRequired(path: string) {
  if (!shouldNotifySubscriptionRequired(path)) return;
  subscriptionRequiredHandler?.();
}

function withAuthHeaders(extra?: HeadersInit): HeadersInit {
  const token = getAccessToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extra || {}),
  };
}

async function tryRefreshSession(): Promise<"ok" | "expired" | "subscription"> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...withAuthHeaders(),
        },
        body: JSON.stringify({}),
      });
      let json: ApiResponse<{ accessToken?: string }> | null = null;
      try {
        json = (await res.json()) as ApiResponse<{ accessToken?: string }>;
      } catch {
        return "expired";
      }
      if (res.status === 402 || json.error?.code === "SUBSCRIPTION_REQUIRED") {
        return "subscription";
      }
      if (!res.ok || json.error) return "expired";
      const nextToken = json.data?.accessToken;
      if (typeof nextToken === "string" && nextToken) {
        setAccessToken(nextToken);
        void fetch("/api/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: nextToken }),
        }).catch(() => undefined);
      }
      return "ok";
    } catch {
      return "expired";
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, formData, headers, _retry, credentials, ...rest } = options;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: credentials ?? "include",
    headers: formData
      ? withAuthHeaders(headers)
      : {
          "Content-Type": "application/json",
          ...withAuthHeaders(headers),
        },
    body:
      body === undefined
        ? undefined
        : formData
          ? (body as BodyInit)
          : JSON.stringify(body),
  });

  const isAuthPath =
    path.startsWith("/auth/login") ||
    path.startsWith("/auth/register") ||
    path.startsWith("/auth/refresh") ||
    path.startsWith("/auth/forgot") ||
    path.startsWith("/auth/reset") ||
    path.startsWith("/billing/checkout") ||
    path.startsWith("/billing/confirm-session");

  if (res.status === 401 && !_retry && !isAuthPath) {
    const refreshed = await tryRefreshSession();
    if (refreshed === "ok") {
      return api<T>(path, { ...options, _retry: true });
    }
    if (refreshed === "subscription") {
      notifySubscriptionRequired(path);
      throw new ApiError(
        "Sua assinatura não está ativa.",
        "SUBSCRIPTION_REQUIRED",
        402,
      );
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
    const error = new ApiError(
      json.error?.message ?? "Erro na API",
      json.error?.code ?? "UNKNOWN",
      res.status,
      json.error?.details,
    );
    if (isSubscriptionRequired(error)) {
      notifySubscriptionRequired(path);
    }
    throw error;
  }

  return json.data;
}

export function getApiUrl() {
  return API_URL;
}
