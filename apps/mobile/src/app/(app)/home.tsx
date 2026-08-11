import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { LineChart } from "react-native-chart-kit";
import Svg, { Circle, G } from "react-native-svg";

import AppNavbar from "../../components/AppNavbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Facility {
  name: string;
  type: string;
  status: "normal" | "warning";
  icon: keyof typeof Ionicons.glyphMap;
}

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
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const USER_NAME = "Alejandro";

const FACILITIES: Facility[] = [
  { name: "Main House", type: "House", status: "normal", icon: "home-outline" },
  { name: "Petco", type: "Building", status: "normal", icon: "business-outline" },
  { name: "Logistics Center", type: "Warehouse", status: "warning", icon: "cube-outline" },
];

const ALERTS: AlertItem[] = [
  {
    id: "1",
    severity: "red",
    label: "Leak Warning",
    location: "Logistics Center",
    detail: "Abnormal night flow detected.",
    icon: "alert-circle-outline",
  },
  {
    id: "2",
    severity: "yellow",
    label: "High Usage",
    location: "Main House",
    detail: "+20% threshold exceeded.",
    icon: "trending-up-outline",
  },
];

const DISTRIBUTION: DistributionItem[] = [
  { label: "Main House", percentage: 55, color: "#2563EB" },
  { label: "Petco", percentage: 30, color: "#60A5FA" },
  { label: "Logistics", percentage: 15, color: "#BFDBFE" },
];

const TREND_DATA = {
  labels: ["M", "T", "W", "T", "F", "S", "S"],
  datasets: [{ data: [20, 25, 22, 30, 28, 45, 50] }],
};

// ─── Shared card base style ───────────────────────────────────────────────────
// flex: 1 + alignItems: "stretch" on parent rows gives equal-height columns
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
          width: `${Math.min(100, progress * 100)}%`,
          backgroundColor: "#2563EB",
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
  const slices = data.map((item) => {
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

// ─── Row helper — stretch makes all sibling cards equal height ────────────────
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

  // onLayout captures real pixel width so the LineChart never overflows
  const [trendCardWidth, setTrendCardWidth] = React.useState(280);

  // ── Global Consumption Card ─────────────────────────────────────────────────
  const GlobalConsumptionCard = (
    <Animated.View entering={FadeInDown.delay(50).springify()} style={cardBase}>
      {/* ── Top section ── */}
      <View>
        {/* Header row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>
              Global Consumption
            </Text>
            <Text style={{ fontSize: 11, color: "#94a3b8", marginTop: 1 }}>
              (Current Month)
            </Text>
          </View>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="water" size={20} color="#3B82F6" />
          </View>
        </View>

        {/* Metric */}
        <View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 20 }}>
          <Text style={{ fontSize: 40, fontWeight: "800", color: "#0f172a", letterSpacing: -1 }}>
            1,245
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: "#64748b", marginLeft: 4 }}>
            m³
          </Text>
        </View>

        {/* Usage vs Goal */}
        <Text style={{ fontSize: 10, fontWeight: "600", color: "#94a3b8", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>
          Usage vs Goal
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <ProgressBar progress={1245 / 1660} />
          </View>
          <Text style={{ fontSize: 11, color: "#64748b", fontWeight: "600", flexShrink: 0 }}>
            1,245 / 1,660 m³
          </Text>
        </View>
      </View>

      {/* ── Footer — pushed to bottom ── */}
      <View>
        <View style={{ height: 1, backgroundColor: "#f1f5f9", marginVertical: 14 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e293b" }}>
            Est. Bill: $340 MXN
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f0fdf4", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Feather name="arrow-down" size={11} color="#16A34A" />
            <Text style={{ fontSize: 11, color: "#15803d", fontWeight: "700" }}>
              12% vs last month
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  // ── Active System Alerts Card ────────────────────────────────────────────────
  const AlertsCard = (
    <Animated.View entering={FadeInDown.delay(100).springify()} style={cardBase}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#dc2626", flex: 1 }}>
          Active System Alerts
        </Text>
        <Ionicons name="warning" size={18} color="#EF4444" />
      </View>

      {/* Alert rows */}
      <View style={{ gap: 10, flex: 1 }}>
        {ALERTS.map((alert) => {
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
    </Animated.View>
  );

  // ── Quick Actions Card ──────────────────────────────────────────────────────
  const QuickActionsCard = (
    <Animated.View entering={FadeInDown.delay(150).springify()} style={cardBase}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>Quick Actions</Text>
        <Feather name="zap" size={16} color="#6B7280" />
      </View>

      <View style={{ gap: 10, flex: 1, justifyContent: "center" }}>
        {/* Primary solid blue */}
        <TouchableOpacity
          style={{ backgroundColor: "#2563EB", borderRadius: 12, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="line-scan" size={16} color="white" />
          <Text style={{ color: "white", fontSize: 13, fontWeight: "700" }}>
            Scan Water Receipt (OCR)
          </Text>
        </TouchableOpacity>

        {/* Secondary outlined */}
        <TouchableOpacity
          style={{ borderWidth: 1.5, borderColor: "#e2e8f0", borderRadius: 12, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }}
          activeOpacity={0.8}
        >
          <Feather name="edit-2" size={14} color="#374151" />
          <Text style={{ color: "#374151", fontSize: 13, fontWeight: "600" }}>
            Add Manual Reading
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  // ── Facility Status Overview Card ───────────────────────────────────────────
  const FacilityCard = (
    <Animated.View entering={FadeInDown.delay(200).springify()} style={cardBase}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a" }}>
          Facility Status Overview
        </Text>
        <MaterialCommunityIcons name="view-grid-outline" size={18} color="#6B7280" />
      </View>

      {/* 3 property tiles — flex-row, wraps on small screens */}
      <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", flex: 1 }}>
        {FACILITIES.map((facility) => {
          const isNormal = facility.status === "normal";
          return (
            <View
              key={facility.name}
              style={{ flex: 1, minWidth: 100, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12 }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 }}>
                <Ionicons name={facility.icon} size={13} color="#374151" />
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1e293b", flexShrink: 1 }} numberOfLines={1}>
                  {facility.name}
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>
                {facility.type}
              </Text>
              {/* Status badge */}
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, backgroundColor: isNormal ? "#f0fdf4" : "#fff1f2" }}>
                {isNormal
                  ? <Ionicons name="checkmark-circle-outline" size={11} color="#16A34A" />
                  : <Ionicons name="warning-outline" size={11} color="#EF4444" />}
                <Text style={{ fontSize: 10, fontWeight: "700", color: isNormal ? "#15803d" : "#dc2626" }}>
                  {isNormal ? "Normal Usage" : "Check Leak"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </Animated.View>
  );

  // ── Consumption Distribution Card ───────────────────────────────────────────
  const DistributionCard = (
    <Animated.View entering={FadeInDown.delay(250).springify()} style={cardBase}>
      <Text style={{ fontSize: 14, fontWeight: "700", color: "#0f172a", marginBottom: 16 }}>
        Consumption Distribution
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 16, flex: 1 }}>
        <DonutChart data={DISTRIBUTION} />
        <View style={{ flex: 1, gap: 8 }}>
          {DISTRIBUTION.map((item) => (
            <View key={item.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color }} />
                <Text style={{ fontSize: 12, color: "#475569" }}>{item.label}</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#1e293b" }}>
                {item.percentage}%
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );

  // ── 7-Day Usage Trend Card ──────────────────────────────────────────────────
  const TrendCard = (
    <Animated.View
      entering={FadeInDown.delay(300).springify()}
      style={{ ...cardBase, overflow: "hidden" }}
      onLayout={(e) => {
        const measured = e.nativeEvent.layout.width - 32; // subtract card padding
        if (measured > 0) setTrendCardWidth(measured);
      }}
    >
      {/* Header */}
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

      {/* Chart — left-shift by 8 so y-axis labels don't clip, overflow:hidden clips any bleed */}
      <View style={{ marginLeft: -8, overflow: "hidden" }}>
        <LineChart
          data={TREND_DATA}
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

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }} edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Centered max-width container matching the reference design */}
        <View style={{ width: "100%", maxWidth: 1280, alignSelf: "center", paddingHorizontal: 20, paddingVertical: 28, gap: 16 }}>

          {/* Greeting */}
          <Animated.Text
            entering={FadeInDown.delay(0).springify()}
            style={{ fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 4 }}
          >
            Welcome {USER_NAME}!
          </Animated.Text>

          {isLarge ? (
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
