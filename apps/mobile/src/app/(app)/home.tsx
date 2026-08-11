import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle, G } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppNavbar from "../../components/AppNavbar";
import { supabase } from "@/src/lib/supabase";
import { getBuildings, BuildingRecord } from "@/src/lib/edificios";
import { fetchConsumptions, DailyConsumption } from "@/src/lib/consumptions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertItem {
  id: string;
  severity: "red" | "yellow";
  label: string;
  location: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface DistributionItem {
  label: string;
  percentage: number;
  color: string;
  buildingTotal?: number;
}

// ─── Shared card base style ───────────────────────────────────────────────────
const cardBase = {
  backgroundColor: "#ffffff",
  borderRadius: 16,
  borderWidth: 1,
  borderColor: "#e2e8f0",
  padding: 20,
  flex: 1,
  flexDirection: "column" as const,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.06,
  shadowRadius: 4,
  elevation: 2,
};

const PALETTE = ["#2563EB", "#38BDF8", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#64748B"];

// ─── Sub-Components ───────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <View
      style={{
        width: "100%",
        height: 10,
        backgroundColor: "#e2e8f0",
        borderRadius: 999,
        overflow: "hidden",
      }}
    >
      <View
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, progress * 100))}%`,
          backgroundColor: progress > 1 ? "#EF4444" : "#2563EB",
          borderRadius: 999,
        }}
      />
    </View>
  );
}

function DonutChart({ data }: { data: DistributionItem[] }) {
  const size = 84;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  let offset = 0;
  const validData = data.length > 0 ? data : [{ label: "None", percentage: 100, color: "#E2E8F0" }];

  const slices = validData.map((item) => {
    const dash = (item.percentage / 100) * circumference;
    const gap = circumference - dash;
    const slice = { ...item, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G rotation="-90" origin={`${cx},${cy}`}>
        {slices.map((s, i) => (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={radius}
            stroke={s.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
      </G>
    </Svg>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "stretch" }}>
      {children}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isLarge = width >= 900;
  const isMedium = width >= 600;

  const [trendCardWidth, setTrendCardWidth] = useState(280);
  const [userName, setUserName] = useState<string>("User");
  const [buildings, setBuildings] = useState<BuildingRecord[]>([]);
  const [allConsumptions, setAllConsumptions] = useState<Record<number, DailyConsumption[]>>({});
  const [buildingSettings, setBuildingSettings] = useState<Record<number, { monthlyTarget: number; abnormalThreshold: number }>>({});
  const [loading, setLoading] = useState(true);

  // Load all user data on focus
  useFocusEffect(
    useCallback(() => {
      const loadDashboardData = async () => {
        setLoading(true);

        // 1. Get user name
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const metaName = session.user.user_metadata?.full_name || session.user.user_metadata?.name;
          if (metaName) {
            setUserName(metaName.split(" ")[0]);
          } else if (session.user.email) {
            setUserName(session.user.email.split("@")[0]);
          }
        }

        // 2. Get all buildings
        const buildingList = await getBuildings();
        const loadedBuildings = buildingList ?? [];
        setBuildings(loadedBuildings);

        // 3. Fetch consumptions & settings for all buildings
        const consumptionsMap: Record<number, DailyConsumption[]> = {};
        const settingsMap: Record<number, { monthlyTarget: number; abnormalThreshold: number }> = {};

        for (const b of loadedBuildings) {
          const cons = await fetchConsumptions(b.id);
          consumptionsMap[b.id] = cons ?? [];

          try {
            const saved = await AsyncStorage.getItem(`building_settings_${b.id}`);
            if (saved) {
              const parsed = JSON.parse(saved);
              settingsMap[b.id] = {
                monthlyTarget: parsed.monthlyTarget || 100,
                abnormalThreshold: parsed.abnormalThreshold || 30,
              };
            } else {
              settingsMap[b.id] = { monthlyTarget: 100, abnormalThreshold: 30 };
            }
          } catch (e) {
            settingsMap[b.id] = { monthlyTarget: 100, abnormalThreshold: 30 };
          }
        }

        setAllConsumptions(consumptionsMap);
        setBuildingSettings(settingsMap);
        setLoading(false);
      };

      loadDashboardData();
    }, [])
  );

  // ── Calculate Dashboard Metrics ─────────────────────────────────────────────
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
  const lastMonthYear = lastMonthDate.getFullYear();
  const lastMonthMonth = lastMonthDate.getMonth();

  let globalCurrentMonthTotal = 0;
  let globalLastMonthTotal = 0;
  let globalTarget = 0;

  const facilityItems: { name: string; type: string; status: "normal" | "warning"; icon: keyof typeof Ionicons.glyphMap }[] = [];
  const alertsList: AlertItem[] = [];
  const distributionItems: DistributionItem[] = [];

  buildings.forEach((building, idx) => {
    const bCons = allConsumptions[building.id] || [];
    const settings = buildingSettings[building.id] || { monthlyTarget: 100, abnormalThreshold: 30 };

    globalTarget += settings.monthlyTarget;

    let bMonthTotal = 0;
    let bHasAlert = false;

    bCons.forEach((c) => {
      const parts = c.log_date.split("-");
      if (parts.length === 3) {
        const yr = parseInt(parts[0], 10);
        const mo = parseInt(parts[1], 10) - 1;
        const dy = parseInt(parts[2], 10);

        if (yr === currentYear && mo === currentMonth) {
          bMonthTotal += c.cubic_meters;
          globalCurrentMonthTotal += c.cubic_meters;

          if (c.cubic_meters > settings.abnormalThreshold) {
            bHasAlert = true;
            alertsList.push({
              id: `${building.id}-${c.log_date}`,
              severity: c.cubic_meters > settings.abnormalThreshold * 1.5 ? "red" : "yellow",
              label: c.cubic_meters > settings.abnormalThreshold * 1.5 ? "High Leak Warning" : "High Usage Alert",
              location: building.alias,
              detail: `${c.cubic_meters.toFixed(1)} m³ logged on ${parts[1]}/${parts[2]} (limit: ${settings.abnormalThreshold}m³)`,
              icon: c.cubic_meters > settings.abnormalThreshold * 1.5 ? "alert-circle-outline" : "trending-up-outline",
            });
          }
        } else if (yr === lastMonthYear && mo === lastMonthMonth) {
          globalLastMonthTotal += c.cubic_meters;
        }
      }
    });

    facilityItems.push({
      name: building.alias,
      type: building.description || "Building",
      status: bHasAlert ? "warning" : "normal",
      icon: "business-outline",
    });

    distributionItems.push({
      label: building.alias,
      percentage: 0,
      color: PALETTE[idx % PALETTE.length],
      buildingTotal: bMonthTotal,
    });
  });

  // Calculate percentages for distribution
  if (globalCurrentMonthTotal > 0) {
    distributionItems.forEach((item) => {
      item.percentage = Math.round(((item.buildingTotal || 0) / globalCurrentMonthTotal) * 100);
    });
  } else if (distributionItems.length > 0) {
    const equalPct = Math.round(100 / distributionItems.length);
    distributionItems.forEach((item) => {
      item.percentage = equalPct;
    });
  }

  // Fallback target if 0
  if (globalTarget === 0) {
    globalTarget = buildings.length > 0 ? buildings.length * 100 : 100;
  }

  // % Change vs last month
  let percentVsLastMonth = 0;
  if (globalLastMonthTotal > 0) {
    percentVsLastMonth = Math.round(((globalCurrentMonthTotal - globalLastMonthTotal) / globalLastMonthTotal) * 100);
  }

  // 7-day trend calculation across ALL buildings
  const trendLabels: string[] = [];
  const trendValues: number[] = [];
  const dayNamesShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    trendLabels.push(dayNamesShort[d.getDay()]);

    let daySum = 0;
    buildings.forEach((b) => {
      const bCons = allConsumptions[b.id] || [];
      const match = bCons.find((c) => c.log_date === dateKey);
      if (match) {
        daySum += match.cubic_meters;
      }
    });
    trendValues.push(Math.round(daySum * 10) / 10);
  }

  const trendData = {
    labels: trendLabels,
    datasets: [{ data: trendValues }],
  };

  // ── Cards ───────────────────────────────────────────────────────────────────

  const GlobalConsumptionCard = (
    <Animated.View entering={FadeInDown.delay(50).springify()} style={cardBase}>
      <View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>
              Global Consumption
            </Text>
            <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
              Current Month Across {buildings.length} {buildings.length === 1 ? "Building" : "Buildings"}
            </Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="water" size={20} color="#3B82F6" />
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 20 }}>
          <Text style={{ fontSize: 40, fontWeight: "800", color: "#0f172a", letterSpacing: -1 }}>
            {globalCurrentMonthTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#64748b", marginLeft: 4 }}>
            m³
          </Text>
        </View>

        <Text style={{ fontSize: 10, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
          Global Usage vs Target
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar progress={globalTarget > 0 ? globalCurrentMonthTotal / globalTarget : 0} />
          </View>
          <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "600", flexShrink: 0 }}>
            {globalCurrentMonthTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })} / {globalTarget} m³
          </Text>
        </View>
      </View>

      <View>
        <View style={{ height: 1, backgroundColor: "#f1f5f9", marginVertical: 14 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#64748b" }}>
            Total Registered: {buildings.length} {buildings.length === 1 ? "Facility" : "Facilities"}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              backgroundColor: percentVsLastMonth <= 0 ? "#f0fdf4" : "#fff1f2",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
            }}
          >
            <Feather
              name={percentVsLastMonth <= 0 ? "arrow-down" : "arrow-up"}
              size={11}
              color={percentVsLastMonth <= 0 ? "#16A34A" : "#EF4444"}
            />
            <Text
              style={{
                fontSize: 11,
                color: percentVsLastMonth <= 0 ? "#15803d" : "#dc2626",
                fontWeight: "700",
              }}
            >
              {Math.abs(percentVsLastMonth)}% vs last month
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const AlertsCard = (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={cardBase}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: alertsList.length > 0 ? "#dc2626" : "#0f172a", flex: 1 }}>
          Active System Alerts ({alertsList.length})
        </Text>
        <Ionicons name="warning" size={18} color={alertsList.length > 0 ? "#EF4444" : "#10B981"} />
      </View>

      <View style={{ gap: 10, flex: 1 }}>
        {alertsList.length === 0 ? (
          <View
            style={{
              padding: 16,
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              backgroundColor: "#f0fdf4",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#bbf7d0",
            }}
          >
            <Ionicons name="checkmark-circle-outline" size={24} color="#16A34A" />
            <Text style={{ fontSize: 13, fontWeight: "700", color: "#15803d", marginTop: 4 }}>
              All Systems Normal
            </Text>
            <Text style={{ fontSize: 11, color: "#16a34a", textAlign: "center", marginTop: 2 }}>
              No abnormal consumption detected across your facilities.
            </Text>
          </View>
        ) : (
          <ScrollView nestedScrollEnabled style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              {alertsList.map((alert) => {
                const isRed = alert.severity === "red";
                return (
                  <View
                    key={alert.id}
                    style={{
                      borderRadius: 12,
                      padding: 12,
                      backgroundColor: isRed ? "#fff1f2" : "#fffbeb",
                      borderWidth: 1,
                      borderColor: isRed ? "#fecdd3" : "#fde68a",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                      <Ionicons name={alert.icon} size={13} color={isRed ? "#EF4444" : "#D97706"} />
                      <Text style={{ fontSize: 12, fontWeight: "700", color: isRed ? "#dc2626" : "#b45309" }}>
                        {alert.label}
                      </Text>
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e293b", marginBottom: 2 }}>
                      {alert.location}
                    </Text>
                    <Text style={{ fontSize: 11, color: "#64748b" }}>{alert.detail}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );

  const QuickActionsCard = (
    <Animated.View entering={FadeInDown.delay(150).springify()} style={cardBase}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>Quick Actions</Text>
        <Feather name="zap" size={16} color="#6B7280" />
      </View>

      <View style={{ gap: 10, flex: 1, justifyContent: "center" }}>
        <TouchableOpacity
          onPress={() => router.push("/myBuildings" as any)}
          style={{
            backgroundColor: "#2563EB",
            borderRadius: 12,
            paddingVertical: 13,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="line-scan" size={16} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>
            Scan Receipt / Add Building
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/consumptions" as any)}
          style={{
            borderWidth: 1.5,
            borderColor: "#e2e8f0",
            borderRadius: 12,
            paddingVertical: 13,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={14} color="#374151" />
          <Text style={{ color: "#374151", fontSize: 13, fontWeight: "600" }}>
            Log Manual Water Reading
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const FacilityCard = (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={cardBase}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>
          Facility Status Overview
        </Text>
        <TouchableOpacity onPress={() => router.push("/myBuildings" as any)}>
          <Text style={{ fontSize: 11, fontWeight: "700", color: "#2563EB" }}>Manage ({buildings.length})</Text>
        </TouchableOpacity>
      </View>

      {facilityItems.length === 0 ? (
        <View style={{ padding: 16, alignItems: "center", justifyContent: "center", flex: 1, backgroundColor: "#f8fafc", borderRadius: 12, borderWidth: 1, borderColor: "#e2e8f0" }}>
          <Feather name="home" size={24} color="#9CA3AF" />
          <Text style={{ fontSize: 13, fontWeight: "600", color: "#64748b", marginTop: 4 }}>No facilities registered</Text>
          <TouchableOpacity
            onPress={() => router.push("/myBuildings" as any)}
            style={{ marginTop: 8, backgroundColor: "#2563EB", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: "white" }}>+ Add First Building</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", flex: 1 }}>
          {facilityItems.map((facility) => {
            const isNormal = facility.status === "normal";
            return (
              <View
                key={facility.name}
                style={{ flex: 1, minWidth: 110, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12 }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
                  <Ionicons name={facility.icon} size={13} color="#374151" />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e293b", flexShrink: 1 }} numberOfLines={1}>
                    {facility.name}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }} numberOfLines={1}>
                  {facility.type}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    alignSelf: "flex-start",
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 999,
                    backgroundColor: isNormal ? "#f0fdf4" : "#fff1f2",
                  }}
                >
                  {isNormal ? (
                    <Ionicons name="checkmark-circle-outline" size={11} color="#16A34A" />
                  ) : (
                    <Ionicons name="warning-outline" size={11} color="#EF4444" />
                  )}
                  <Text style={{ fontSize: 10, fontWeight: "700", color: isNormal ? "#15803d" : "#dc2626" }}>
                    {isNormal ? "Normal Usage" : "High Usage"}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </Animated.View>
  );

  const DistributionCard = (
    <Animated.View entering={FadeInDown.delay(250).springify()} style={cardBase}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 16 }}>
        Consumption Distribution
      </Text>
      {distributionItems.length === 0 ? (
        <View style={{ padding: 16, alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Text style={{ fontSize: 12, color: "#94a3b8" }}>No buildings to display</Text>
        </View>
      ) : (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 16, flex: 1 }}>
          <DonutChart data={distributionItems} />
          <ScrollView nestedScrollEnabled style={{ flex: 1, maxHeight: 110 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 8 }}>
              {distributionItems.map((item) => (
                <View key={item.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flex: 1, marginRight: 8 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                    <Text style={{ fontSize: 12, color: "#475569" }} numberOfLines={1}>{item.label}</Text>
                  </View>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: "#1e293b" }}>
                    {item.percentage}%
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );

  const TrendCard = (
    <Animated.View
      entering={FadeInDown.delay(300).springify()}
      style={{ ...cardBase, overflow: "hidden" }}
      onLayout={(e) => {
        const measured = e.nativeEvent.layout.width - 32;
        if (measured > 0) setTrendCardWidth(measured);
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>7-Day Usage Trend</Text>
        <TouchableOpacity
          onPress={() => router.push("/consumptions" as any)}
          activeOpacity={0.7}
          style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#2563EB" }}>View Detailed Analytics</Text>
          <Feather name="arrow-right" size={12} color="#2563EB" />
        </TouchableOpacity>
      </View>

      <View style={{ marginLeft: -8, overflow: "hidden" }}>
        <LineChart
          data={trendData}
          width={trendCardWidth + 8}
          height={130}
          yAxisSuffix=""
          yAxisInterval={1}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(148, 163, 184, ${opacity})`,
            style: { borderRadius: 12 },
            propsForDots: { r: "4", strokeWidth: "2", stroke: "#2563EB", fill: "#2563EB" },
            propsForBackgroundLines: { stroke: "#f1f5f9", strokeWidth: 1 },
          }}
          bezier
          style={{ borderRadius: 12 }}
          withInnerLines
          withOuterLines={false}
          withShadow={false}
          fromZero
        />
      </View>
    </Animated.View>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 28, gap: 16 }}>
          {/* Greeting */}
          <Animated.Text
            entering={FadeInDown.delay(0).springify()}
            style={{ fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 4 }}
          >
            Welcome {userName}!
          </Animated.Text>

          {loading ? (
            <View style={{ padding: 40, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#2563EB" />
              <Text style={{ fontSize: 13, color: "#94a3b8", marginTop: 12 }}>Loading dashboard statistics...</Text>
            </View>
          ) : isLarge ? (
            <>
              {/* Row 1: Global (flex 2) | Alerts (flex 1.5) | Quick Actions (flex 1) */}
              <Row>
                <View style={{ flex: 2 }}>{GlobalConsumptionCard}</View>
                <View style={{ flex: 1.5 }}>{AlertsCard}</View>
                <View style={{ flex: 1 }}>{QuickActionsCard}</View>
              </Row>

              {/* Row 2: Facility (flex 2) | Distribution (flex 1) | Trend (flex 2) */}
              <Row>
                <View style={{ flex: 2 }}>{FacilityCard}</View>
                <View style={{ flex: 1 }}>{DistributionCard}</View>
                <View style={{ flex: 2 }}>{TrendCard}</View>
              </Row>
            </>
          ) : isMedium ? (
            <>
              <Row>
                <View style={{ flex: 1 }}>{GlobalConsumptionCard}</View>
                <View style={{ flex: 1 }}>{AlertsCard}</View>
              </Row>
              {QuickActionsCard}
              {FacilityCard}
              <Row>
                <View style={{ flex: 1 }}>{DistributionCard}</View>
                <View style={{ flex: 2 }}>{TrendCard}</View>
              </Row>
            </>
          ) : (
            <>
              {GlobalConsumptionCard}
              {AlertsCard}
              {QuickActionsCard}
              {FacilityCard}
              {DistributionCard}
              {TrendCard}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
