import type { LiveChatChannelMode } from "../features/shop-discussion/components/live-chat-panel";

export interface BuildWhatsAppUrlOptions {
  phone?: string;
  shopName: string;
  shopId?: string;
  channel?: LiveChatChannelMode;
  giftTitle?: string;
  priceKes?: number;
  customMessage?: string;
}

export function normalizeWhatsAppPhone(rawPhone?: string): string {
  if (!rawPhone) return "";
  const digitsOnly = rawPhone.replace(/\D/g, "");
  if (!digitsOnly) return "";

  if (digitsOnly.startsWith("254") && digitsOnly.length >= 12) {
    return digitsOnly;
  }
  if (digitsOnly.startsWith("0") && digitsOnly.length === 10) {
    return `254${digitsOnly.slice(1)}`;
  }
  if (
    (digitsOnly.startsWith("7") || digitsOnly.startsWith("1")) &&
    digitsOnly.length === 9
  ) {
    return `254${digitsOnly}`;
  }
  return digitsOnly;
}

export function buildWhatsAppMessage(options: BuildWhatsAppUrlOptions): string {
  if (options.customMessage?.trim()) {
    return options.customMessage.trim();
  }

  const parts: string[] = [`Hello ${options.shopName} (BLAC SANTA)`];

  if (options.giftTitle) {
    const pricePart =
      typeof options.priceKes === "number"
        ? ` — KES ${options.priceKes.toLocaleString("en-KE")}`
        : "";
    parts.push(`regarding "${options.giftTitle}"${pricePart}.`);
  } else {
    parts.push("— reaching out from the shop discussion.");
  }

  if (options.channel) {
    parts.push(`Channel: ${options.channel}.`);
  }

  return parts.join(" ");
}

export function buildWhatsAppUrl(options: BuildWhatsAppUrlOptions): string {
  const phone = normalizeWhatsAppPhone(options.phone);
  const text = encodeURIComponent(buildWhatsAppMessage(options));
  if (phone) {
    return `https://wa.me/${phone}?text=${text}`;
  }
  return `https://wa.me/?text=${text}`;
}

export default buildWhatsAppUrl;
