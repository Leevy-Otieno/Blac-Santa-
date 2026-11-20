export type PayoutChannelType = "till" | "paybill" | "phone";

export type MerchantVerificationStatus =
  | "Unverified"
  | "Submitted"
  | "Verified";

export interface MerchantPayoutSettings {
  shopId: string;
  /** National ID or Business Registration / Certificate of Incorporation number */
  idOrRegistrationNumber: string;
  /** Legal account / business name matching ID or Till */
  legalAccountName: string;
  verificationStatus: MerchantVerificationStatus;
  /** How buyers send money for this vendor */
  payoutChannel: PayoutChannelType;
  /** M-Pesa Till Number, PayBill Shortcode, or +254 mobile number */
  recipientDestination: string;
  /** Optional account number when using PayBill */
  paybillAccountNumber?: string;
  /** Platform commission percentage charged on each gift transaction */
  platformFeePercent: number;
  updatedAt: string;
}

export interface SaveMerchantPayoutInput {
  shopId: string;
  idOrRegistrationNumber: string;
  legalAccountName: string;
  payoutChannel: PayoutChannelType;
  recipientDestination: string;
  paybillAccountNumber?: string;
  submitForVerification?: boolean;
}

export interface GiftPaymentBreakdown {
  grossAmountKsh: number;
  commissionPercent: number;
  platformCommissionKsh: number;
  merchantNetAmountKsh: number;
  payoutChannel: PayoutChannelType;
  recipientDestination: string;
  paybillAccountNumber?: string;
}

export interface GiftPaymentTransaction extends GiftPaymentBreakdown {
  id: string;
  giftId: string;
  giftTitle: string;
  shopId: string;
  buyerPhone: string;
  status: "Pending" | "Paid" | "Failed";
  providerReference?: string;
  createdAt: string;
}
