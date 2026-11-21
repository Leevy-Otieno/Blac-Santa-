import {
  BlackSantaChatMessage,
  BlackSantaPinpointedShop,
  BlackSantaSuggestedGift,
  GiftProduct,
  MarketplaceShop,
} from "../types/marketplace.types";

const GEMINI_MODEL = "gemini-2.5-flash";

export interface GenerateBlackSantaReplyParams {
  history: BlackSantaChatMessage[];
  availableShops?: MarketplaceShop[];
  availableGifts?: GiftProduct[];
  recipient?: string;
  occasion?: string;
  budgetLabel?: string;
}

export interface BlackSantaReplyResult {
  text: string;
  pinpointedShops: BlackSantaPinpointedShop[];
  suggestedGifts: BlackSantaSuggestedGift[];
}

function pinpointRealShops(
  prompt: string,
  availableShops: MarketplaceShop[],
): BlackSantaPinpointedShop[] {
  const activeShops = availableShops.filter(
    (shop) => shop.isAvailable !== false,
  );
  if (activeShops.length === 0) return [];

  const lower = prompt.toLowerCase();
  const matched = activeShops.filter((shop) => {
    const haystack =
      `${shop.name} ${shop.neighborhood} ${shop.address ?? ""} ${shop.specialty}`.toLowerCase();
    const keywords = lower
      .split(/[^a-z0-9]+/)
      .filter((word) => word.length >= 3);
    return keywords.some((kw) => haystack.includes(kw));
  });

  const selected = (matched.length > 0 ? matched : activeShops).slice(0, 3);

  return selected.map((shop) => ({
    shopId: shop.id,
    shopName: shop.name,
    neighborhood: shop.neighborhood,
    phone: shop.phone,
    reason: shop.specialty || `Available shop in ${shop.neighborhood}`,
  }));
}

function matchRealGifts(
  prompt: string,
  availableGifts: GiftProduct[],
  pinpointedShops: BlackSantaPinpointedShop[],
): BlackSantaSuggestedGift[] {
  const inStockGifts = availableGifts.filter((gift) => gift.inStock !== false);
  if (inStockGifts.length === 0) return [];

  const lower = prompt.toLowerCase();
  const keywords = lower.split(/[^a-z0-9]+/).filter((word) => word.length >= 3);

  const shopIds = new Set(pinpointedShops.map((s) => s.shopId));

  const scored = inStockGifts
    .map((gift) => {
      const text =
        `${gift.title} ${gift.description ?? ""} ${gift.category ?? ""} ${gift.recipientTag ?? ""} ${gift.occasionTag ?? ""} ${gift.shopName} ${gift.neighborhood}`.toLowerCase();
      let score = shopIds.has(gift.shopId) ? 2 : 0;
      for (const kw of keywords) {
        if (text.includes(kw)) score += 3;
      }
      return { gift, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ gift }) => ({
      id: `gift-${gift.id}`,
      giftId: gift.id,
      shopId: gift.shopId,
      title: gift.title,
      priceKsh: gift.priceKsh,
      reason:
        gift.description?.trim() ||
        `Available at ${gift.shopName} (${gift.neighborhood})`,
      shopName: gift.shopName,
      neighborhood: gift.neighborhood,
      shopPhone: gift.shopPhone,
    }));

  return scored;
}

function buildFallbackReply(
  params: GenerateBlackSantaReplyParams,
  pinpointedShops: BlackSantaPinpointedShop[],
  suggestedGifts: BlackSantaSuggestedGift[],
): BlackSantaReplyResult {
  const lastUserMsg =
    [...params.history].reverse().find((m) => m.role === "user")?.text ?? "";
  const who = params.recipient || "your recipient";
  const occ = params.occasion || "your occasion";
  const budget = params.budgetLabel || "your Ksh budget";

  if (pinpointedShops.length === 0 && suggestedGifts.length === 0) {
    return {
      text: `I'm here as Black Santa to guide you for ${who} (${occ}, ${budget}). Tell me a little about their personality, hobbies, or what vibe you're going for—and once shops and gifts are loaded from the marketplace, I'll pinpoint them right here for you.`,
      pinpointedShops: [],
      suggestedGifts: [],
    };
  }

  const shopNames = pinpointedShops
    .map((s) => `${s.shopName} (${s.neighborhood})`)
    .join(", ");
  return {
    text: `Based on "${lastUserMsg}" for ${who} (${occ}, ${budget}), I've pinpointed ${pinpointedShops.length} available shop(s) in the app: ${shopNames}. Tap any pinpointed shop to jump straight to it.`,
    pinpointedShops,
    suggestedGifts,
  };
}

export async function generateBlackSantaReply(
  params: GenerateBlackSantaReplyParams,
): Promise<BlackSantaReplyResult> {
  const {
    history,
    availableShops = [],
    availableGifts = [],
    recipient,
    occasion,
    budgetLabel,
  } = params;

  const latestPrompt =
    [...history].reverse().find((m) => m.role === "user")?.text ?? "";

  const pinpointedShops = pinpointRealShops(latestPrompt, availableShops);
  const suggestedGifts = matchRealGifts(
    latestPrompt,
    availableGifts,
    pinpointedShops,
  );
  const fallback = buildFallbackReply(params, pinpointedShops, suggestedGifts);

  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return fallback;
  }

  const realShopsContext =
    availableShops.length > 0
      ? availableShops
          .filter((s) => s.isAvailable !== false)
          .map(
            (s) =>
              `- [id:${s.id}] ${s.name} (${s.neighborhood}): ${s.specialty}`,
          )
          .join("\n")
      : "No shops are currently loaded in client state; guide the user on gift types/ideas and ask clarifying questions without inventing fake shop names.";

  const realGiftsContext =
    availableGifts.length > 0
      ? availableGifts
          .filter((g) => g.inStock !== false)
          .slice(0, 25)
          .map(
            (g) =>
              `- [id:${g.id}] ${g.title} — Ksh ${g.priceKsh} at ${g.shopName} (${g.neighborhood})`,
          )
          .join("\n")
      : "No live gift catalog items loaded yet; focus on gift directions, criteria, and helpful guidance.";

  const systemInstruction = [
    "You are Black Santa, a warm, sharp, conversational gift concierge for the BLAC SANTA marketplace in Nairobi, Kenya.",
    "Remember everything discussed earlier in the conversation history.",
    "If the user does not have a gift idea yet, guide them thoughtfully with practical gift directions tailored to the recipient, occasion, and budget in Kenyan Shillings (Ksh).",
    "Only reference shops or gifts from the provided live marketplace lists; never invent fictional shops or prices.",
    "Keep responses natural, conversational, clear, and concise.",
    "Live Available Shops:\n" + realShopsContext,
    "Live Available Gifts:\n" + realGiftsContext,
  ].join("\n\n");

  const contextPrefix = [
    recipient ? `Active Recipient Filter: ${recipient}` : null,
    occasion ? `Active Occasion Filter: ${occasion}` : null,
    budgetLabel ? `Active Budget Filter: ${budgetLabel}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const geminiContents = history
    .filter((msg) => msg.text.trim().length > 0)
    .slice(-16)
    .map((msg, index, arr) => {
      const isLastUser =
        msg.role === "user" &&
        index === arr.length - 1 &&
        contextPrefix.length > 0;
      const contentText = isLastUser
        ? `${contextPrefix}\n${msg.text}`
        : msg.text;
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: contentText }],
      };
    });

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(
      apiKey,
    )}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 550,
        },
      }),
    });

    if (!response.ok) {
      return fallback;
    }

    const data = await response.json();
    const replyText: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!replyText || !replyText.trim()) {
      return fallback;
    }

    return {
      text: replyText.trim(),
      pinpointedShops,
      suggestedGifts,
    };
  } catch {
    return fallback;
  }
}
