export interface FormatKshOptions {
  includeCurrency?: boolean;
  prefix?: "KES" | "KSh";
  decimals?: number;
}

export function formatKsh(
  amount: number | string | null | undefined,
  options: FormatKshOptions = {},
): string {
  const { includeCurrency = true, prefix = "KES", decimals = 0 } = options;

  const numeric =
    typeof amount === "number"
      ? amount
      : typeof amount === "string"
        ? Number(amount.replace(/,/g, "").trim())
        : NaN;

  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const formattedNumber = safeValue.toLocaleString("en-KE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (!includeCurrency) {
    return formattedNumber;
  }

  return `${prefix} ${formattedNumber}`;
}

export default formatKsh;
