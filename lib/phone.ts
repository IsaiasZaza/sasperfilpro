/** Dígitos de um telefone, sem máscara. */
export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Número brasileiro para wa.me: DDI 55 + DDD + número.
 * `61999999999` vira `5561999999999`.
 */
export function withBrazilDdi(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";
  if (digits.startsWith("55")) return digits.slice(0, 13);
  const local = digits.replace(/^0+/, "");
  if (local.length >= 10 && local.length <= 11) {
    return `55${local}`.slice(0, 13);
  }
  return local.slice(0, 13);
}

/** Máscara de exibição: +55 (61) 99999-9999 */
export function formatBrazilPhone(value: string) {
  const digits = digitsOnly(value);
  if (!digits) return "";

  const withDdi = digits.startsWith("55")
    ? digits.slice(0, 13)
    : digits.length >= 10
      ? withBrazilDdi(digits)
      : digits;
  const rest = withDdi.startsWith("55") ? withDdi.slice(2) : withDdi;
  const prefix = withDdi.startsWith("55") || digits.length >= 10 ? "+55" : "";

  if (!rest) return prefix || "";
  const ddd = rest.slice(0, 2);
  const num = rest.slice(2);
  const head = prefix ? `${prefix} ` : "";

  if (rest.length <= 2) {
    return prefix ? `${prefix} (${ddd}` : ddd;
  }
  if (!num) return `${head}(${ddd})`;
  if (num.length <= 4) return `${head}(${ddd}) ${num}`;
  if (num.length <= 8) {
    return `${head}(${ddd}) ${num.slice(0, num.length - 4)}-${num.slice(-4)}`;
  }
  return `${head}(${ddd}) ${num.slice(0, 5)}-${num.slice(5, 9)}`;
}
