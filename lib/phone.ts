/** Dígitos de um telefone, sem máscara. */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Número internacional para wa.me (E.164): só dígitos, até 15.
 * Inclua o código do país (ex.: 55 Brasil, 351 Portugal, 1 EUA).
 * Não força DDI brasileiro.
 */
export function normalizeWhatsAppPhone(value: string) {
  return digitsOnly(value).slice(0, 15);
}

/** @deprecated Use normalizeWhatsAppPhone — mantido para imports antigos. */
export function withBrazilDdi(value: string) {
  return normalizeWhatsAppPhone(value);
}

/** Exibição amigável: +5511999999999 */
export function formatWhatsAppPhone(value: string) {
  const digits = normalizeWhatsAppPhone(value);
  if (!digits) return "";
  return `+${digits}`;
}

/** @deprecated Use formatWhatsAppPhone */
export function formatBrazilPhone(value: string) {
  return formatWhatsAppPhone(value);
}

/** wa.me aceita 8–15 dígitos com código do país. */
export function isValidWhatsAppPhone(value: string) {
  const digits = normalizeWhatsAppPhone(value);
  return digits.length >= 8 && digits.length <= 15;
}
