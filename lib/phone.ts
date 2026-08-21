/** Dígitos de um telefone, sem máscara. */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Número internacional para wa.me (E.164): só dígitos, 10–15, com DDI.
 * Ex.: 5511999999999 (BR), 351912345678 (PT), 5491123456789 (AR).
 */
export function normalizeWhatsAppPhone(value: string) {
  return digitsOnly(value).slice(0, 15);
}

/** @deprecated Use normalizeWhatsAppPhone */
export function withBrazilDdi(value: string) {
  return normalizeWhatsAppPhone(value);
}

/**
 * Campo editável: mostra só dígitos (sem "+"), para bater com a API.
 * O "+" fica só no hint / preview do link.
 */
export function formatWhatsAppPhone(value: string) {
  return normalizeWhatsAppPhone(value);
}

/** @deprecated Use formatWhatsAppPhone */
export function formatBrazilPhone(value: string) {
  return formatWhatsAppPhone(value);
}

/** Alinhado à API: 10–15 dígitos com código do país. */
export function isValidWhatsAppPhone(value: string) {
  const digits = normalizeWhatsAppPhone(value);
  return digits.length >= 10 && digits.length <= 15;
}
