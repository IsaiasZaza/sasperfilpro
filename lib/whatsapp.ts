/**
 * Número do WhatsApp no formato internacional, apenas dígitos.
 * Exemplo: 5561999999999 (55 + DDD + número)
 *
 * Altere aqui ou defina NEXT_PUBLIC_WHATSAPP_NUMBER no .env
 */
export const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5561992443666";

export const WHATSAPP_MESSAGE =
  "Olá! Vi o PerfilPro e quero criar minha página profissional.";

export function getWhatsAppUrl(message: string = WHATSAPP_MESSAGE) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
