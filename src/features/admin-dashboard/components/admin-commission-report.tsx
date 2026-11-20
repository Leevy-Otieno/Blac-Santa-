import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { AdminCommissionReport } from "../../orders/types/order.types";

export interface AdminCommissionReportProps {
  report: AdminCommissionReport;
  className?: string;
}

export function AdminCommissionReportCard({
  report,
  className = "",
}: AdminCommissionReportProps) {
  const { width } = useWindowDimensions();
  const isCompact = width < 380;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      className={`gap-3.5 ${className}`}
    >
      {/* Overall Admin Revenue & Commission Summary */}
      <View
        className={`bg-rose-950 rounded-3xl border border-rose-900 ${
          isCompact ? "p-4" : "p-5"
        }`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-[10px] font-extrabold uppercase tracking-wider text-rose-300">
              BLAC SANTA Admin Oversight
            </Text>
            <Text className="text-lg font-extrabold text-white mt-0.5">
              Sales & Commission Report
            </Text>
          </View>
          <View className="h-10 w-10 rounded-2xl bg-rose-600 items-center justify-center">
            <Ionicons name="stats-chart" size={20} color="#FFFFFF" />
          </View>
        </View>

        <View className="gap-2.5">
          <View className="bg-rose-900/80 border border-rose-800 rounded-2xl p-3.5">
            <Text className="text-[11px] font-bold text-rose-200">
              Your Commission Earned
            </Text>
            <Text className="text-xl font-extrabold text-white mt-0.5">
              Ksh {report.totalCommissionEarnedKsh.toLocaleString("en-KE")}
            </Text>
          </View>

          <View className="flex-row gap-2.5">
            <View className="flex-1 bg-rose-900/60 border border-rose-800 rounded-2xl p-3">
              <Text className="text-[10px] font-bold text-rose-200">
                Total Gross Sales
              </Text>
              <Text className="text-sm font-extrabold text-white mt-0.5">
                Ksh {report.totalGrossSalesKsh.toLocaleString("en-KE")}
              </Text>
            </View>

            <View className="flex-1 bg-rose-900/60 border border-rose-800 rounded-2xl p-3">
              <Text className="text-[10px] font-bold text-rose-200">
                Vendor Net Share
              </Text>
              <Text className="text-sm font-extrabold text-emerald-300 mt-0.5">
                Ksh {report.totalMerchantNetPayoutsKsh.toLocaleString("en-KE")}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Health Across Platform */}
        <View className="flex-row items-center justify-between mt-3.5 pt-3 border-t border-rose-800">
          <Text className="text-[11px] font-bold text-rose-200">
            Orders: {report.totalOrdersCount}
          </Text>
          <Text className="text-[11px] font-bold text-emerald-300">
            Delivered: {report.deliveredCount}
          </Text>
          <Text className="text-[11px] font-bold text-amber-300">
            Shipping: {report.pendingOrShippingCount}
          </Text>
          <Text className="text-[11px] font-bold text-rose-300">
            Not Recv: {report.notReceivedCount}
          </Text>
        </View>
      </View>

      {/* Per-Shop Breakdown */}
      <View className="bg-white rounded-3xl p-4 border border-rose-100 shadow-xs gap-2.5">
        <Text className="text-sm font-extrabold text-rose-950">
          Sales & Commission by Shop
        </Text>

        {report.byShop.map((shop) => (
          <View
            key={shop.shopId}
            className="bg-rose-50/70 border border-rose-100 rounded-2xl p-3"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-xs font-extrabold text-rose-950 flex-1 pr-2">
                {shop.shopName}
              </Text>
              <Text className="text-xs font-extrabold text-rose-600">
                Fee: Ksh {shop.platformCommissionKsh.toLocaleString("en-KE")}
              </Text>
            </View>

            <View className="flex-row items-center justify-between mt-1">
              <Text className="text-[11px] text-rose-800/80">
                Sales: Ksh {shop.grossSalesKsh.toLocaleString("en-KE")} • Net:
                Ksh {shop.merchantEarningsKsh.toLocaleString("en-KE")}
              </Text>
              <Text className="text-[10px] font-bold text-rose-700">
                {shop.deliveredOrders}/{shop.totalOrders} Delivered
              </Text>
            </View>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

export default AdminCommissionReportCard;
