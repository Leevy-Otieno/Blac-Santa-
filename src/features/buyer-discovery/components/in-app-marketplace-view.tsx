import React, { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { InventoryGiftItem } from "../../inventory/types/inventory.types";
import { useGiftOrders } from "../../orders/hooks/use-gift-orders";
import { ShopDiscussionDialog } from "../../shop-discussion/components/shop-discussion-dialog";
import type { TaggedShopReference } from "../../shop-discussion/types/shop-discussion.types";
import type { MerchantPayoutSettings } from "../../shop-dashboard/types/payout.types";
import { BuyerOrderTracker } from "./buyer-order-tracker";
import { GiftCard } from "./gift-card";
import { MpesaOrderCheckoutModal } from "./mpesa-order-checkout-modal";

export interface InAppMarketplaceViewProps {
  shopId: string;
  shopName?: string;
  payoutSettings?: MerchantPayoutSettings | null;
  onSelectGift?: (gift: InventoryGiftItem) => void;
  className?: string;
}

export function InAppMarketplaceView({
  shopId,
  shopName = "",
  payoutSettings = null,
  onSelectGift,
  className = "",
}: InAppMarketplaceViewProps) {
  const insets = useSafeAreaInsets();
  const [selectedGift, setSelectedGift] = useState<InventoryGiftItem | null>(
    null,
  );

  const {
    orders,
    inventory,
    mutating,
    error,
    lastPaymentFeedback,
    clearError,
    clearPaymentFeedback,
    placeOrder,
    retryMpesaPin,
  } = useGiftOrders({
    shopId,
    shopName,
  });

  const activeGift = selectedGift
    ? (inventory.find((item) => item.id === selectedGift.id) ?? selectedGift)
    : null;

  const availableShops = useMemo<TaggedShopReference[]>(() => {
    const map = new Map<string, TaggedShopReference>();
    for (const item of inventory) {
      if (item.shopId && item.shopName && !map.has(item.shopId)) {
        map.set(item.shopId, {
          shopId: item.shopId,
          shopName: item.shopName,
        });
      }
    }
    if (shopId && shopName && !map.has(shopId)) {
      map.set(shopId, { shopId, shopName });
    }
    return Array.from(map.values());
  }, [inventory, shopId, shopName]);

  const resolvedShopName = shopName || availableShops[0]?.shopName || "Shop";

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        padding: 16,
        paddingBottom: Math.max(insets.bottom, 24),
        gap: 16,
      }}
      className={className}
    >
      {(lastPaymentFeedback || error) && (
        <View
          className={`rounded-2xl p-3.5 border ${
            lastPaymentFeedback && !lastPaymentFeedback.succeeded
              ? "bg-rose-100 border-rose-300"
              : error
                ? "bg-rose-100 border-rose-300"
                : "bg-emerald-50 border-emerald-200"
          }`}
        >
          <Text
            className={`text-xs font-extrabold ${
              lastPaymentFeedback && !lastPaymentFeedback.succeeded
                ? "text-rose-900"
                : error
                  ? "text-rose-900"
                  : "text-emerald-800"
            }`}
          >
            {lastPaymentFeedback
              ? `${lastPaymentFeedback.orderNumber}: ${lastPaymentFeedback.message}`
              : error}
          </Text>
        </View>
      )}

      <View className="bg-white rounded-3xl p-4 border border-rose-100 gap-2.5">
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-rose-950">
              Shop Thread & Ratings
            </Text>
            <Text className="text-[11px] text-rose-700/75 mt-0.5">
              Chat with buyers, tagged shops & admins or rate {resolvedShopName}
              .
            </Text>
          </View>
        </View>

        <ShopDiscussionDialog
          shopId={shopId}
          shopName={resolvedShopName}
          availableShops={availableShops}
          defaultRole="buyer"
          buttonLabel="Open Shop Discussion"
        />
      </View>

      <View className="gap-3">
        <Text className="text-base font-extrabold text-rose-950">
          Gifts Available in App
        </Text>

        {inventory.length === 0 ? (
          <View className="bg-white rounded-3xl p-5 border border-rose-100">
            <Text className="text-xs font-extrabold text-rose-950">
              No Gifts Listed Yet
            </Text>
            <Text className="text-[11px] text-rose-700/75 mt-1">
              Add gift listings with stock in the shop dashboard to display them
              here.
            </Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {inventory.map((gift, index) => (
              <GiftCard
                key={gift.id}
                gift={{
                  id: gift.id,
                  title: gift.title,
                  priceKsh: gift.priceKsh,
                  shopId: gift.shopId,
                  shopName: gift.shopName,
                  category: gift.category,
                  occasion: gift.occasion,
                  imageUrl: gift.imageUrl,
                  stockQuantity: gift.stockQuantity,
                  inStock: gift.inStock,
                }}
                index={index}
                layout="grid"
                availableShops={availableShops}
                onPress={(item) => {
                  const matched = inventory.find((inv) => inv.id === item.id);
                  if (matched && onSelectGift) {
                    onSelectGift(matched);
                  } else if (matched) {
                    clearError();
                    clearPaymentFeedback();
                    setSelectedGift(matched);
                  }
                }}
                onOrderGift={(item) => {
                  const matched = inventory.find((inv) => inv.id === item.id);
                  if (!matched) return;
                  clearError();
                  clearPaymentFeedback();
                  setSelectedGift(matched);
                }}
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-2.5">
        <Text className="text-base font-extrabold text-rose-950">
          Your In-App Orders & Delivery Updates
        </Text>
        <BuyerOrderTracker
          orders={orders}
          mutating={mutating}
          onRetryPin={retryMpesaPin}
        />
      </View>

      {activeGift && (
        <MpesaOrderCheckoutModal
          visible={Boolean(activeGift)}
          onClose={() => setSelectedGift(null)}
          giftTitle={activeGift.title}
          unitPriceKsh={activeGift.priceKsh}
          commissionPercent={payoutSettings?.platformFeePercent ?? 5}
          availableStock={activeGift.stockQuantity}
          shopName={activeGift.shopName}
          recipientDestination={payoutSettings?.recipientDestination ?? ""}
          submitting={mutating}
          failureNotice={
            lastPaymentFeedback && !lastPaymentFeedback.succeeded
              ? lastPaymentFeedback.message
              : null
          }
          onSubmitOrderWithMpesa={async (payload) => {
            const created = await placeOrder({
              giftId: activeGift.id,
              giftTitle: activeGift.title,
              giftImageUrl: activeGift.imageUrl,
              quantity: payload.quantity,
              unitPriceKsh: activeGift.priceKsh,
              commissionPercent: payoutSettings?.platformFeePercent ?? 5,
              shopId: activeGift.shopId,
              shopName: activeGift.shopName,
              recipientDestination: payoutSettings?.recipientDestination ?? "",
              payoutChannel: payoutSettings?.payoutChannel ?? "till",
              paybillAccountNumber: payoutSettings?.paybillAccountNumber,
              buyerName: payload.buyerName,
              buyerPhone: payload.buyerPhone,
              deliveryAddress: payload.deliveryAddress,
              paymentOutcome: payload.simulatedOutcome,
            });

            if (created?.isPaidAndConfirmed) {
              setSelectedGift(null);
            }
          }}
        />
      )}
    </ScrollView>
  );
}

export default InAppMarketplaceView;
