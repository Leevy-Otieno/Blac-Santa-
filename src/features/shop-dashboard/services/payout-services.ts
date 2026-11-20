import type {
  GiftPaymentBreakdown,
  GiftPaymentTransaction,
  MerchantPayoutSettings,
  SaveMerchantPayoutInput,
} from "../types/payout.types";

const DEFAULT_COMMISSION_PERCENT = 5;

function normalizePhoneE164(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("254")) return `+${digits.slice(0, 12)}`;
  if (digits.startsWith("0") && digits.length >= 10) {
    return `+254${digits.slice(1, 10)}`;
  }
  if (digits.length === 9) return `+254${digits}`;
  return raw.startsWith("+") ? raw.trim() : `+${digits}`;
}

function validateDestination(
  channel: SaveMerchantPayoutInput["payoutChannel"],
  rawDestination: string,
  accountNumber?: string,
): { destination: string; paybillAccountNumber?: string } {
  const trimmed = rawDestination.trim();
  if (!trimmed) {
    throw new Error(
      "Enter the recipient Till number, PayBill, or phone number.",
    );
  }

  if (channel === "phone") {
    const formattedPhone = normalizePhoneE164(trimmed);
    const digits = formattedPhone.replace(/\D/g, "");
    if (digits.length !== 12 || !digits.startsWith("254")) {
      throw new Error(
        "Enter a valid Kenyan recipient mobile number (e.g., +254712345678).",
      );
    }
    return { destination: formattedPhone };
  }

  const numericOnly = trimmed.replace(/\D/g, "");
  if (channel === "till") {
    if (numericOnly.length < 5 || numericOnly.length > 8) {
      throw new Error("Enter a valid M-Pesa Till number (5 to 8 digits).");
    }
    return { destination: numericOnly };
  }

  if (numericOnly.length < 5 || numericOnly.length > 8) {
    throw new Error("Enter a valid M-Pesa PayBill business number.");
  }
  const cleanAccount = (accountNumber ?? "").trim();
  if (!cleanAccount) {
    throw new Error(
      "Enter the PayBill Account Number buyers should reference.",
    );
  }
  return { destination: numericOnly, paybillAccountNumber: cleanAccount };
}

// Starts empty so shops configure their own ID and Till/PayBill/phone in the app
let payoutSettingsStore: Record<string, MerchantPayoutSettings> = {};
let transactionsStore: GiftPaymentTransaction[] = [];

export const payoutService = {
  calculateCommissionSplit(
    grossAmountKsh: number,
    settings: Pick<
      MerchantPayoutSettings,
      | "platformFeePercent"
      | "payoutChannel"
      | "recipientDestination"
      | "paybillAccountNumber"
    >,
  ): GiftPaymentBreakdown {
    const safeGross = Math.max(0, Math.round(grossAmountKsh));
    const clampedRate = Math.max(0, Math.min(50, settings.platformFeePercent));
    const platformCommissionKsh = Math.round((safeGross * clampedRate) / 100);
    const merchantNetAmountKsh = Math.max(0, safeGross - platformCommissionKsh);

    return {
      grossAmountKsh: safeGross,
      commissionPercent: clampedRate,
      platformCommissionKsh,
      merchantNetAmountKsh,
      payoutChannel: settings.payoutChannel,
      recipientDestination: settings.recipientDestination,
      paybillAccountNumber: settings.paybillAccountNumber,
    };
  },

  async getPayoutSettings(shopId: string): Promise<MerchantPayoutSettings> {
    const existing = payoutSettingsStore[shopId];
    if (existing) {
      return { ...existing };
    }

    return {
      shopId,
      idOrRegistrationNumber: "",
      legalAccountName: "",
      verificationStatus: "Unverified",
      payoutChannel: "till",
      recipientDestination: "",
      platformFeePercent: DEFAULT_COMMISSION_PERCENT,
      updatedAt: new Date().toISOString(),
    };
  },

  async savePayoutSettings(
    input: SaveMerchantPayoutInput,
  ): Promise<MerchantPayoutSettings> {
    const idNumber = input.idOrRegistrationNumber.trim();
    const accountName = input.legalAccountName.trim();

    if (!idNumber || idNumber.length < 5) {
      throw new Error(
        "Enter a valid National ID or Business Registration number.",
      );
    }
    if (!accountName || accountName.length < 2) {
      throw new Error(
        "Enter the account / owner name matching your ID or Till.",
      );
    }

    const validatedDest = validateDestination(
      input.payoutChannel,
      input.recipientDestination,
      input.paybillAccountNumber,
    );

    const prev = payoutSettingsStore[input.shopId];
    const now = new Date().toISOString();

    const updated: MerchantPayoutSettings = {
      shopId: input.shopId,
      idOrRegistrationNumber: idNumber,
      legalAccountName: accountName,
      verificationStatus: input.submitForVerification
        ? prev?.verificationStatus === "Verified"
          ? "Verified"
          : "Submitted"
        : (prev?.verificationStatus ?? "Unverified"),
      payoutChannel: input.payoutChannel,
      recipientDestination: validatedDest.destination,
      paybillAccountNumber: validatedDest.paybillAccountNumber,
      platformFeePercent:
        prev?.platformFeePercent ?? DEFAULT_COMMISSION_PERCENT,
      updatedAt: now,
    };

    payoutSettingsStore = {
      ...payoutSettingsStore,
      [input.shopId]: updated,
    };

    return { ...updated };
  },

  async updateCommissionPercent(
    shopId: string,
    platformFeePercent: number,
  ): Promise<MerchantPayoutSettings> {
    const current = await this.getPayoutSettings(shopId);
    const nextPercent = Math.max(
      0,
      Math.min(50, Number(platformFeePercent) || 0),
    );

    const updated: MerchantPayoutSettings = {
      ...current,
      platformFeePercent: nextPercent,
      updatedAt: new Date().toISOString(),
    };

    payoutSettingsStore = {
      ...payoutSettingsStore,
      [shopId]: updated,
    };

    return { ...updated };
  },

  async recordGiftPayment(params: {
    giftId: string;
    giftTitle: string;
    shopId: string;
    amountKsh: number;
    buyerPhone: string;
  }): Promise<GiftPaymentTransaction> {
    const settings = await this.getPayoutSettings(params.shopId);
    if (!settings.recipientDestination) {
      throw new Error(
        "Configure a Till number, PayBill, or recipient phone number first.",
      );
    }

    const buyerFormatted = normalizePhoneE164(params.buyerPhone);
    const buyerDigits = buyerFormatted.replace(/\D/g, "");
    if (buyerDigits.length !== 12 || !buyerDigits.startsWith("254")) {
      throw new Error("Enter a valid Kenyan buyer phone number (+2547...).");
    }

    const split = this.calculateCommissionSplit(params.amountKsh, settings);

    const tx: GiftPaymentTransaction = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      giftId: params.giftId,
      giftTitle: params.giftTitle,
      shopId: params.shopId,
      buyerPhone: buyerFormatted,
      status: "Paid",
      providerReference: `BS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      ...split,
    };

    transactionsStore = [tx, ...transactionsStore];
    return { ...tx };
  },

  async listTransactions(shopId?: string): Promise<GiftPaymentTransaction[]> {
    const rows = shopId
      ? transactionsStore.filter((t) => t.shopId === shopId)
      : transactionsStore;
    return rows.map((r) => ({ ...r }));
  },
};
