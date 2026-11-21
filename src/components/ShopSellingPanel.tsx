import React, { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NewGiftListingInput } from "../hooks/use-shop-operations";
import {
  GiftProduct,
  MarketplaceOrder,
  OrderStatus,
  ShopRevenueSummary,
} from "../types/marketplace.types";
import { buildWhatsAppUrl } from "../utils/build-whatsapp-url";
import { formatKsh } from "../utils/format-ksh";

interface ShopSellingPanelProps {
  shopId?: string;
  shopName?: string;
  defaultNeighborhood?: string;
  defaultPhone?: string;
  products: GiftProduct[];
  orders: MarketplaceOrder[];
  revenueSummary: ShopRevenueSummary;
  onAddListing: (input: NewGiftListingInput) => void;
  onToggleStock: (productId: string) => void;
  onRemoveProduct: (productId: string) => void;
  onUpdateOrderStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

const ORDER_STATUS_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

function formatStatusLabel(status: OrderStatus): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "confirmed":
      return "Confirmed";
    case "out_for_delivery":
      return "Out for Delivery";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export const ShopSellingPanel: React.FC<ShopSellingPanelProps> = ({
  shopId = "",
  shopName = "",
  defaultNeighborhood = "",
  defaultPhone = "",
  products,
  orders,
  revenueSummary,
  onAddListing,
  onToggleStock,
  onRemoveProduct,
  onUpdateOrderStatus,
}) => {
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const [activeTab, setActiveTab] = useState<"orders" | "listings" | "new">(
    "orders",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  // New listing form state
  const [title, setTitle] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [neighborhood, setNeighborhood] = useState(defaultNeighborhood);
  const [phone, setPhone] = useState(defaultPhone);
  const [recipientTag, setRecipientTag] = useState("");
  const [occasionTag, setOccasionTag] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "all") return orders;
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const handleCreateListing = () => {
    const parsedPrice = Number(priceInput.replace(/[^0-9.]/g, ""));
    if (!title.trim()) {
      setFormError("Please enter a gift title.");
      return;
    }
    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setFormError("Please enter a valid price in Ksh.");
      return;
    }

    setFormError(null);
    onAddListing({
      shopId,
      shopName,
      neighborhood: neighborhood || defaultNeighborhood || "Nairobi",
      shopPhone: phone || defaultPhone,
      title: title.trim(),
      priceKsh: parsedPrice,
      recipientTag: recipientTag.trim() || undefined,
      occasionTag: occasionTag.trim() || undefined,
      description: description.trim() || undefined,
      inStock: true,
    });

    setTitle("");
    setPriceInput("");
    setRecipientTag("");
    setOccasionTag("");
    setDescription("");
    setActiveTab("listings");
  };

  const handleContactBuyer = async (order: MarketplaceOrder) => {
    const msg = `Hi ${order.buyerName}, regarding your BLAC SANTA order (${order.itemTitle}) — current status: ${formatStatusLabel(order.status)}.`;
    const url = buildWhatsAppUrl(order.buyerPhone, msg);
    try {
      await Linking.openURL(url);
    } catch {
      // Ignore if device cannot open external scheme
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-brand-bg px-4 pt-4"
      contentContainerStyle={{ paddingBottom: 110 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Shop Revenue & Commission Snapshot */}
      <View className="rounded-3xl bg-brand-surface p-4 border border-brand-border mb-4">
        <Text className="text-xs font-bold uppercase tracking-wider text-brand-textMuted">
          {shopName || "Shop"} • Revenue & Commission
        </Text>
        <Text className="mt-1 text-2xl font-extrabold text-brand-text">
          {formatKsh(revenueSummary.netRevenueKsh)}
        </Text>
        <Text className="text-xs text-brand-textMuted">
          Net Shop Earnings (after platform commission)
        </Text>

        <View className={`mt-3 gap-2.5 ${isWide ? "flex-row" : "flex-col"}`}>
          <View className="flex-1 rounded-2xl bg-brand-bg p-3 border border-brand-border">
            <Text className="text-[11px] font-semibold text-brand-textMuted">
              Gross Sales
            </Text>
            <Text className="mt-0.5 text-sm font-extrabold text-brand-text">
              {formatKsh(revenueSummary.grossSalesKsh)}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-brand-bg p-3 border border-brand-border">
            <Text className="text-[11px] font-semibold text-brand-textMuted">
              Platform Commission
            </Text>
            <Text className="mt-0.5 text-sm font-extrabold text-brand-primary">
              {formatKsh(revenueSummary.commissionDeductedKsh)}
            </Text>
          </View>

          <View className="flex-1 rounded-2xl bg-brand-bg p-3 border border-brand-border">
            <Text className="text-[11px] font-semibold text-brand-textMuted">
              Completed Orders
            </Text>
            <Text className="mt-0.5 text-sm font-extrabold text-brand-text">
              {revenueSummary.completedOrders} / {revenueSummary.totalOrders}
            </Text>
          </View>
        </View>
      </View>

      {/* Section Switcher */}
      <View className="flex-row gap-2 mb-4">
        <Pressable
          onPress={() => setActiveTab("orders")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3 px-3 border ${
            activeTab === "orders"
              ? "bg-brand-primary border-brand-primary"
              : "bg-brand-surface border-brand-border"
          }`}
        >
          <Ionicons
            name="receipt-outline"
            size={16}
            color={activeTab === "orders" ? "#FFFFFF" : "#4C0519"}
          />
          <Text
            numberOfLines={1}
            className={`text-xs font-bold ${
              activeTab === "orders" ? "text-white" : "text-brand-text"
            }`}
          >
            Orders ({orders.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("listings")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3 px-3 border ${
            activeTab === "listings"
              ? "bg-brand-primary border-brand-primary"
              : "bg-brand-surface border-brand-border"
          }`}
        >
          <Ionicons
            name="gift-outline"
            size={16}
            color={activeTab === "listings" ? "#FFFFFF" : "#4C0519"}
          />
          <Text
            numberOfLines={1}
            className={`text-xs font-bold ${
              activeTab === "listings" ? "text-white" : "text-brand-text"
            }`}
          >
            Gifts ({products.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("new")}
          className={`flex-1 flex-row items-center justify-center gap-1.5 rounded-2xl py-3 px-3 border ${
            activeTab === "new"
              ? "bg-brand-primary border-brand-primary"
              : "bg-brand-surface border-brand-border"
          }`}
        >
          <Ionicons
            name="add-circle-outline"
            size={16}
            color={activeTab === "new" ? "#FFFFFF" : "#4C0519"}
          />
          <Text
            numberOfLines={1}
            className={`text-xs font-bold ${
              activeTab === "new" ? "text-white" : "text-brand-text"
            }`}
          >
            Add Gift
          </Text>
        </Pressable>
      </View>

      {/* ORDERS TAB */}
      {activeTab === "orders" && (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-3"
            contentContainerStyle={{ gap: 8, paddingRight: 8 }}
          >
            {(
              [{ key: "all", label: "All" }, ...ORDER_STATUS_STEPS] as {
                key: "all" | OrderStatus;
                label: string;
              }[]
            ).map((chip) => {
              const selected = statusFilter === chip.key;
              return (
                <Pressable
                  key={chip.key}
                  onPress={() => setStatusFilter(chip.key)}
                  className={`rounded-full px-3.5 py-2 border ${
                    selected
                      ? "bg-brand-primary border-brand-primary"
                      : "bg-brand-surface border-brand-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      selected ? "text-white" : "text-brand-text"
                    }`}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {filteredOrders.length === 0 ? (
            <View className="items-center justify-center rounded-3xl bg-brand-surface p-8 border border-brand-border">
              <Ionicons name="bag-handle-outline" size={32} color="#E11D48" />
              <Text className="mt-2 text-sm font-bold text-brand-text">
                No orders in this view yet
              </Text>
              <Text className="mt-1 text-center text-xs text-brand-textMuted">
                Incoming buyer orders from your backend or checkout flow will
                appear here for live status tracking.
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View
                key={order.id}
                className="mb-3 rounded-3xl bg-brand-surface p-4 border border-brand-border"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-brand-text">
                      {order.itemTitle} × {order.quantity}
                    </Text>
                    <Text className="mt-0.5 text-xs text-brand-textMuted">
                      Buyer: {order.buyerName}
                      {order.deliveryNeighborhood
                        ? ` • ${order.deliveryNeighborhood}`
                        : ""}
                    </Text>
                  </View>

                  <View className="rounded-full bg-brand-surfaceMuted px-3 py-1 border border-brand-border">
                    <Text className="text-[11px] font-bold text-brand-primary">
                      {formatStatusLabel(order.status)}
                    </Text>
                  </View>
                </View>

                {/* Breakdown in Ksh */}
                <View className="mt-3 rounded-2xl bg-brand-bg p-3 border border-brand-border gap-1">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-brand-textMuted">
                      Order Gross
                    </Text>
                    <Text className="text-xs font-bold text-brand-text">
                      {formatKsh(order.grossAmountKsh)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-brand-textMuted">
                      Commission ({Math.round(order.commissionRate * 100)}%)
                    </Text>
                    <Text className="text-xs font-bold text-brand-primary">
                      -{formatKsh(order.commissionAmountKsh)}
                    </Text>
                  </View>
                  <View className="flex-row justify-between pt-1 border-t border-brand-border">
                    <Text className="text-xs font-bold text-brand-text">
                      Your Net Payout
                    </Text>
                    <Text className="text-xs font-extrabold text-brand-text">
                      {formatKsh(order.netShopRevenueKsh)}
                    </Text>
                  </View>
                </View>

                {/* Status Action Buttons */}
                <Text className="mt-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-textMuted">
                  Update Order Status
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {ORDER_STATUS_STEPS.map((step) => {
                    const active = order.status === step.key;
                    return (
                      <Pressable
                        key={step.key}
                        onPress={() => onUpdateOrderStatus(order.id, step.key)}
                        className={`rounded-xl px-2.5 py-1.5 border ${
                          active
                            ? "bg-brand-primary border-brand-primary"
                            : "bg-brand-surfaceMuted border-brand-border"
                        }`}
                      >
                        <Text
                          className={`text-[11px] font-bold ${
                            active ? "text-white" : "text-brand-text"
                          }`}
                        >
                          {step.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {order.buyerPhone ? (
                  <Pressable
                    onPress={() => handleContactBuyer(order)}
                    className="mt-3 flex-row items-center justify-center gap-1.5 rounded-xl bg-brand-surfaceMuted py-2.5 px-3 border border-brand-border"
                  >
                    <Ionicons name="logo-whatsapp" size={15} color="#E11D48" />
                    <Text className="text-xs font-bold text-brand-text">
                      Message Buyer via +254
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          )}
        </View>
      )}

      {/* LISTINGS TAB */}
      {activeTab === "listings" && (
        <View>
          {products.length === 0 ? (
            <View className="items-center justify-center rounded-3xl bg-brand-surface p-8 border border-brand-border">
              <Ionicons name="gift-outline" size={32} color="#E11D48" />
              <Text className="mt-2 text-sm font-bold text-brand-text">
                No gift listings yet
              </Text>
              <Text className="mt-1 text-center text-xs text-brand-textMuted">
                Tap "Add Gift" above to publish a gift item for buyers and Black
                Santa recommendations.
              </Text>
            </View>
          ) : (
            products.map((product) => (
              <View
                key={product.id}
                className="mb-3 rounded-3xl bg-brand-surface p-4 border border-brand-border"
              >
                <View className="flex-row items-start justify-between gap-2">
                  <View className="flex-1">
                    <Text className="text-sm font-extrabold text-brand-text">
                      {product.title}
                    </Text>
                    <Text className="mt-0.5 text-xs text-brand-textMuted">
                      {product.neighborhood}
                      {product.recipientTag
                        ? ` • For ${product.recipientTag}`
                        : ""}
                      {product.occasionTag ? ` • ${product.occasionTag}` : ""}
                    </Text>
                  </View>
                  <Text className="text-sm font-extrabold text-brand-primary">
                    {formatKsh(product.priceKsh)}
                  </Text>
                </View>

                {product.description ? (
                  <Text className="mt-1.5 text-xs text-brand-text">
                    {product.description}
                  </Text>
                ) : null}

                <View className="mt-3 flex-row items-center gap-2">
                  <Pressable
                    onPress={() => onToggleStock(product.id)}
                    className={`flex-1 rounded-xl py-2.5 px-3 items-center border ${
                      product.inStock
                        ? "bg-brand-primary border-brand-primary"
                        : "bg-brand-surfaceMuted border-brand-border"
                    }`}
                  >
                    <Text
                      className={`text-xs font-bold ${
                        product.inStock ? "text-white" : "text-brand-text"
                      }`}
                    >
                      {product.inStock ? "In Stock (Active)" : "Out of Stock"}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => onRemoveProduct(product.id)}
                    accessibilityLabel={`Delete ${product.title}`}
                    className="rounded-xl bg-brand-surfaceMuted py-2.5 px-3 border border-brand-border"
                  >
                    <Ionicons name="trash-outline" size={16} color="#9F1239" />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      )}

      {/* ADD GIFT LISTING TAB */}
      {activeTab === "new" && (
        <View className="rounded-3xl bg-brand-surface p-4 border border-brand-border gap-3">
          <Text className="text-base font-extrabold text-brand-text">
            List a Gift for Sale
          </Text>

          {formError ? (
            <Text className="text-xs font-bold text-brand-primary">
              {formError}
            </Text>
          ) : null}

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Gift name (e.g., Signature Scent Hamper)"
            placeholderTextColor="#9F1239"
            className="rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
          />

          <TextInput
            value={priceInput}
            onChangeText={setPriceInput}
            placeholder="Price in Ksh (e.g., 2500)"
            placeholderTextColor="#9F1239"
            keyboardType="numeric"
            className="rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
          />

          <View className={isWide ? "flex-row gap-2.5" : "gap-3"}>
            <TextInput
              value={neighborhood}
              onChangeText={setNeighborhood}
              placeholder="Neighborhood (e.g., Kilimani, Westlands)"
              placeholderTextColor="#9F1239"
              className="flex-1 rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
            />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Shop WhatsApp (+254...)"
              placeholderTextColor="#9F1239"
              keyboardType="phone-pad"
              className="flex-1 rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
            />
          </View>

          <View className={isWide ? "flex-row gap-2.5" : "gap-3"}>
            <TextInput
              value={recipientTag}
              onChangeText={setRecipientTag}
              placeholder="Recipient (e.g., Her, Him, Boss, Kids)"
              placeholderTextColor="#9F1239"
              className="flex-1 rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
            />
            <TextInput
              value={occasionTag}
              onChangeText={setOccasionTag}
              placeholder="Occasion (e.g., Birthday, Anniversary)"
              placeholderTextColor="#9F1239"
              className="flex-1 rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
            />
          </View>

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Short gift details, packaging, or delivery note..."
            placeholderTextColor="#9F1239"
            multiline
            className="min-h-[84px] rounded-2xl bg-brand-bg px-4 py-3 text-sm text-brand-text border border-brand-border"
          />

          <Pressable
            onPress={handleCreateListing}
            className="flex-row items-center justify-center gap-2 rounded-2xl bg-brand-primary py-3.5 px-4"
          >
            <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
            <Text className="text-sm font-extrabold text-white">
              Publish Gift Listing
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
};

export default ShopSellingPanel;
