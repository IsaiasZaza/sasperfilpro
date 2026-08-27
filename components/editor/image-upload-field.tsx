"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { isPlanGateError, planErrorDetails } from "@/lib/billing";
import { cn } from "@/lib/utils";

const IMAGE_MAX_BYTES = 1024 * 1024;
const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function isAllowedImageFile(file: File) {
  if (IMAGE_TYPES.has(file.type.toLowerCase())) return true;
  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

function uploadMessage(err: unknown) {
  if (!(err instanceof ApiError)) {
    return "Não foi possível enviar a imagem. Tente de novo.";
  }
  if (err.code === "FILE_REQUIRED") return "Envie uma imagem";
  if (err.code === "INVALID_FILE_TYPE") return "Use JPEG, PNG ou WEBP";
  if (err.code === "FILE_TOO_LARGE" || err.status === 413) {
    return "A imagem deve ter no máximo 1 MB";
  }
  if (err.code === "STORAGE_ERROR" || err.code === "STORAGE_NOT_CONFIGURED") {
    return "Não foi possível enviar a imagem. Tente de novo.";
  }
  return err.message || "Não foi possível enviar a imagem. Tente de novo.";
}

export function ImageUploadField({
  value,
  onUploaded,
  onRemove,
  onLocked,
  upload,
  variant = "avatar",
  photoSize = 88,
  buttonLabel = "Alterar foto",
  removeLabel = "Remover foto",
  emptyLabel = "Foto",
  hint = "JPEG, PNG ou WEBP. Máximo 1 MB.",
}: {
  value: string | null;
  onUploaded: (url: string) => void;
  onRemove?: () => void;
  onLocked?: () => void;
  upload: (file: File) => Promise<string>;
  variant?: "avatar" | "cover";
  photoSize?: number;
  buttonLabel?: string;
  removeLabel?: string;
  emptyLabel?: string;
  hint?: string;
}) {
  const router = useRouter();
  const { clearSession } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const localUrlRef = useRef<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState(value);
  const [broken, setBroken] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreviewSrc(value);
    setBroken(false);
  }, [value]);

  useEffect(() => {
    return () => {
      if (localUrlRef.current) URL.revokeObjectURL(localUrlRef.current);
    };
  }, []);

  function revokeLocalPreview() {
    if (localUrlRef.current) {
      URL.revokeObjectURL(localUrlRef.current);
      localUrlRef.current = null;
    }
  }

  async function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setError(null);

    if (!isAllowedImageFile(file)) {
      setError("Use JPEG, PNG ou WEBP");
      return;
    }
    if (file.size > IMAGE_MAX_BYTES) {
      setError("A imagem deve ter no máximo 1 MB");
      return;
    }

    revokeLocalPreview();
    const localUrl = URL.createObjectURL(file);
    localUrlRef.current = localUrl;
    setPreviewSrc(localUrl);
    setBroken(false);
    setPending(true);

    try {
      const remoteUrl = await upload(file);
      revokeLocalPreview();
      setPreviewSrc(remoteUrl);
      setBroken(false);
      onUploaded(remoteUrl);
    } catch (err) {
      revokeLocalPreview();
      setPreviewSrc(value);
      if (
        err instanceof ApiError &&
        (err.status === 401 || err.code === "UNAUTHORIZED")
      ) {
        clearSession();
        router.replace("/login");
        return;
      }
      if (isPlanGateError(err)) {
        const details = planErrorDetails(err);
        if (!details || details.entitlement === "customTheme") {
          onLocked?.();
          return;
        }
      }
      setError(uploadMessage(err));
    } finally {
      setPending(false);
    }
  }

  const size = Math.min(Math.max(photoSize, 64), 96);
  const cover = variant === "cover";

  return (
    <div className={cn("flex gap-4", cover ? "flex-col" : "items-center")}>
      <div
        className={cn(
          "relative overflow-hidden border border-line bg-ink/5",
          cover ? "h-28 w-full rounded-2xl" : "shrink-0 rounded-full",
        )}
        style={cover ? undefined : { width: size, height: size }}
      >
        {previewSrc && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewSrc}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <span
            className={cn(
              "flex h-full w-full items-center justify-center font-medium text-muted",
              cover ? "text-[13px]" : "text-[11px]",
            )}
          >
            {emptyLabel}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => void onFileChange(event)}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={pending}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Enviando...
              </>
            ) : (
              buttonLabel
            )}
          </Button>
          {value && onRemove ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pending}
              onClick={() => {
                revokeLocalPreview();
                setPreviewSrc(null);
                setBroken(false);
                setError(null);
                onRemove();
              }}
            >
              {removeLabel}
            </Button>
          ) : null}
        </div>
        <p className="text-[12px] leading-relaxed text-muted">{hint}</p>
        {error ? (
          <p role="alert" className="text-[12px] text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
