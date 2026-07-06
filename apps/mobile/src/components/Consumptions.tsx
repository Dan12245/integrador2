import React, { useState } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-chart-kit/v2";
import { Feather, Ionicons } from "@expo/vector-icons";

const shadowStyle = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 2,
  elevation: 2,
};

const data = [
  { month: "Jan", revenue: 52 },
  { month: "Feb", revenue: 86 },
  { month: "Mar", revenue: 58 },
  { month: "Apr", revenue: 134 },
  { month: "May", revenue: 95 },
  { month: "Jun", revenue: 177 },
  { month: "Jul", revenue: 122 },
  { month: "Aug", revenue: 122 },
  { month: "Sep", revenue: 122 },
  { month: "Oct", revenue: 122 },
  { month: "Nov", revenue: 122 },
  { month: "Dec", revenue: 122 },
];

// Helper to generate dynamic chart data based on the real date
const getChartData = (period: string) => {
  const currentDate = new Date();
  
  if (period === "Week") {
    // Current week (Monday to Sunday)
    const dayOfWeek = currentDate.getDay(); // 0 (Sun) to 6 (Sat)
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + distanceToMonday);

    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const mockValues = [15, 22, 18, 24, 20, 16, 21];
    
    return dayNames.map((day, idx) => {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + idx);
      const isToday = dayDate.toDateString() === currentDate.toDateString();
      return {
        label: isToday ? `${day}` : day,
        value: mockValues[idx],
      };
    });
  }
  
  if (period === "Month") {
    // Each day of the current month until the current day
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayDate = currentDate.getDate(); // e.g. 5
    
    return Array.from({ length: todayDate }, (_, i) => {
      const dayNum = i + 1;
      const isToday = dayNum === todayDate;
      
      const baseVal = 18;
      const valVariation = Math.floor(Math.sin(dayNum * 0.7) * 8);
      
      return {
        label: todayDate <= 10 
          ? (isToday ? `${dayNum}` : `${dayNum}`)
          : (isToday ? `${dayNum}` : (dayNum % 5 === 0 ? `${dayNum}` : "")),
        value: Math.max(5, baseVal + valVariation),
      };
    });
  }
  
  // Year period: months of the actual year until now
  const currentMonth = currentDate.getMonth(); // 0 to 11
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mockValues = [52, 86, 58, 134, 95, 177, 122, 110, 145, 160, 130, 115];
  
  return months.slice(0, currentMonth + 1).map((month, idx) => {
    const isCurrent = idx === currentMonth;
    return {
      label: isCurrent ? `${month}` : month,
      value: mockValues[idx],
    };
  });
};

export function ConsumptionsChart({ data, width }: { data: { label: string; value: number }[]; width?: number }) {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = width || Math.min(windowWidth - 64, 1100);

  return (
    <BarChart
      data={data}
      xKey="label"
      yKey="value"
      scrollable
      visiblePoints={7}
      width={chartWidth}
      height={260}
    />
  );
}

export default function ConsumptionsDashboard() {
  const { width } = useWindowDimensions();
  const [selectedBuilding, setSelectedBuilding] = useState("Main Complex");
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [reportType, setReportType] = useState("Monthly");

  // Determine width of the chart inside dashboard
  // For larger screens (web), we cap the padding or fit it inside a container width.
  const isLargeScreen = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const chartWidth = isLargeScreen ? Math.min(width - 96, 1150) : width - 64;

  // Pre-define components for cards to avoid duplication and keep layout logic clean
  const CardTotalPeriod = (
    <View className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Total period</Text>
        <Ionicons name="water" size={18} color="#3B82F6" />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className="text-2xl font-extrabold text-gray-900">1,245</Text>
        <Text className="text-gray-400 text-xs ml-0.5 font-bold">m³</Text>
      </View>
    </View>
  );

  const CardDailyAverage = (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Daily average</Text>
        <Feather name="trending-up" size={18} color="#1F2937" />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className="text-2xl font-extrabold text-gray-900">41.5</Text>
        <Text className="text-gray-400 text-xs ml-0.5 font-bold">m³</Text>
      </View>
    </View>
  );

  const CardAlerts = (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Alerts</Text>
        <Feather name="alert-triangle" size={18} color="#EF4444" />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className="text-2xl font-extrabold text-red-600">2</Text>
        <Text className="text-red-500 text-[10px] ml-1 font-bold uppercase tracking-wider">active</Text>
      </View>
    </View>
  );

  const CardTargetVsActual = (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Target vs. Actual</Text>
        <Feather name="bar-chart-2" size={18} color="#3B82F6" />
      </View>
      <View className="flex-row items-baseline mb-2">
        <Text className="text-2xl font-extrabold text-gray-900">75%</Text>
        <Text className="text-gray-400 text-[10px] ml-1 font-semibold">used</Text>
      </View>
      <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <View className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }} />
      </View>
      <Text className="text-right text-[8px] text-gray-400 font-bold">1,245/1,660 m³</Text>
    </View>
  );

  const CardReportsInline = (
    <View className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0">
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-row items-center gap-1">
          <Feather name="file-text" size={16} color="#3B82F6" />
          <Text className="text-gray-900 text-xs font-bold">Reports</Text>
        </View>
        <View className="flex-row bg-gray-100 p-0.5 rounded-lg">
          <Pressable 
            onPress={() => setReportType("Monthly")}
            className={`px-2 py-0.5 rounded-md ${reportType === "Monthly" ? "bg-white" : ""}`} style={reportType === "Monthly" ? shadowStyle : undefined}
          >
            <Text className={`text-[10px] font-bold ${reportType === "Monthly" ? "text-gray-900" : "text-gray-400"}`}>Mo</Text>
          </Pressable>
          <Pressable 
            onPress={() => setReportType("Yearly")}
            className={`px-2 py-0.5 rounded-md ${reportType === "Yearly" ? "bg-white" : ""}`} style={reportType === "Yearly" ? shadowStyle : undefined}
          >
            <Text className={`text-[10px] font-bold ${reportType === "Yearly" ? "text-gray-900" : "text-gray-400"}`}>Yr</Text>
          </Pressable>
        </View>
      </View>
      <Pressable className="bg-slate-900 py-2.5 rounded-xl flex-row justify-center items-center gap-1.5 mt-auto active:bg-slate-800">
        <Feather name="download" size={13} color="white" />
        <Text className="text-white text-[10px] font-bold">PDF</Text>
      </Pressable>
    </View>
  );

  const CardReportsFullWidth = (
    <View className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-full mt-4">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-1.5">
          <Feather name="file-text" size={18} color="#3B82F6" />
          <Text className="text-gray-900 text-sm font-bold">Reports</Text>
        </View>
        <View className="flex-row bg-gray-100 p-0.5 rounded-lg">
          <Pressable 
            onPress={() => setReportType("Monthly")}
            className={`px-3 py-1.5 rounded-md ${reportType === "Monthly" ? "bg-white" : ""}`} style={reportType === "Monthly" ? shadowStyle : undefined}
          >
            <Text className={`text-xs font-bold ${reportType === "Monthly" ? "text-gray-900" : "text-gray-400"}`}>Monthly</Text>
          </Pressable>
          <Pressable 
            onPress={() => setReportType("Yearly")}
            className={`px-3 py-1.5 rounded-md ${reportType === "Yearly" ? "bg-white" : ""}`} style={reportType === "Yearly" ? shadowStyle : undefined}
          >
            <Text className={`text-xs font-bold ${reportType === "Yearly" ? "text-gray-900" : "text-gray-400"}`}>Yearly</Text>
          </Pressable>
        </View>
      </View>
      <Pressable className="bg-slate-900 py-3.5 rounded-xl flex-row justify-center items-center gap-2 active:bg-slate-800">
        <Feather name="download" size={15} color="white" />
        <Text className="text-white text-xs font-bold">Download (.PDF)</Text>
      </Pressable>
    </View>
  );

  // Layout Rendering based on screen width
  const renderKPICards = () => {
    if (isLargeScreen) {
      // Large screens (Web Desktop): Row of 5 cards side-by-side
      return (
        <View className="flex-row gap-4 w-full items-stretch">
          {CardTotalPeriod}
          {CardDailyAverage}
          {CardAlerts}
          {CardTargetVsActual}
          {CardReportsInline}
        </View>
      );
    } else if (isTablet) {
      // Medium screens (Tablet): 4 metrics cards in Row 1, Reports card full width in Row 2
      return (
        <View className="w-full">
          <View className="flex-row gap-4 items-stretch">
            {CardTotalPeriod}
            {CardDailyAverage}
            {CardAlerts}
            {CardTargetVsActual}
          </View>
          {CardReportsFullWidth}
        </View>
      );
    } else {
      // Small screens (Mobile Phone): 2 rows of 2 metrics cards, Reports card full width in Row 3
      return (
        <View className="w-full">
          <View className="flex-row gap-3 items-stretch mb-3">
            {CardTotalPeriod}
            {CardDailyAverage}
          </View>
          <View className="flex-row gap-3 items-stretch">
            {CardAlerts}
            {CardTargetVsActual}
          </View>
          {CardReportsFullWidth}
        </View>
      );
    }
  };

  return (
    <View className="p-4 md:p-8 bg-gray-50 flex-1 w-full max-w-7xl mx-auto">
      {/* KPI Cards container */}
      {renderKPICards()}

      {/* Main Selected Building Card */}
      <View className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-gray-100 mt-4">
        <View className="flex-row flex-wrap justify-between items-center">
          <View>
            <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Selected Building</Text>
            <Pressable className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 py-3 bg-gray-50">
              <Text className="text-gray-900 text-sm font-semibold">{selectedBuilding}</Text>
              <Feather name="chevron-down" size={16} color="#6B7280" />
            </Pressable>
          </View>

          {/* Timeframe group */}
          <View className="flex-row bg-gray-100 p-2 mt-8 rounded-xl">
            {["Week", "Month", "Year"].map((period) => (
              <Pressable
                key={period}
                onPress={() => setSelectedPeriod(period)}
                className={`px-4 py-2.5 rounded-lg ${selectedPeriod === period ? "bg-white" : ""}`} style={selectedPeriod === period ? shadowStyle : undefined}
              >
                <Text className={`text-xs font-bold ${selectedPeriod === period ? "text-gray-900" : "text-gray-400"}`}>
                  {period}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Chart container */}
        <View className="items-center justify-center py-4 w-full overflow-hidden">
          <ConsumptionsChart data={getChartData(selectedPeriod)} width={chartWidth} />
        </View>

        {/* Buttons under chart */}
        <View className="flex-row justify-center items-center gap-3 mt-6 flex-wrap">
          <Pressable className="bg-slate-950 px-6 py-3.5 rounded-xl flex-row items-center gap-2 active:bg-slate-800" style={shadowStyle}>
            <Feather name="plus" size={16} color="white" />
            <Text className="text-white text-xs font-bold">Add consumption</Text>
          </Pressable>
          <Pressable className="bg-sky-50 px-6 py-3.5 rounded-xl flex-row items-center gap-2 border border-sky-100 active:bg-sky-100">
            <Feather name="edit-2" size={14} color="#0284C7" />
            <Text className="text-sky-800 text-xs font-bold">Edit records</Text>
          </Pressable>
        </View>
      </View>

      {/* Historical Records Section */}
      <View className="mt-8 mb-12">
        <View className="flex-row items-center mb-6">
          <View className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
          <Text className="text-xl font-extrabold text-gray-900">Historical records</Text>
        </View>

        <View className="gap-3">
          {/* Item 1 */}
          <View className="bg-white p-5 rounded-2xl border border-gray-100 flex-row justify-between items-center shadow-sm">
            <View>
              <Text className="text-gray-400 text-xs font-semibold mb-1">Oct 24, 2024 • 08:00 AM</Text>
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-black text-gray-900">12.5</Text>
                <Text className="text-gray-500 text-sm ml-0.5 font-bold">m³</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full gap-1">
              <Feather name="check" size={12} color="#15803D" />
              <Text className="text-green-700 text-xs font-bold">Normal usage</Text>
            </View>
          </View>

          {/* Item 2 */}
          <View className="bg-white p-5 rounded-2xl border border-gray-100 flex-row justify-between items-center shadow-sm">
            <View>
              <Text className="text-gray-400 text-xs font-semibold mb-1">Oct 23, 2024 • 08:00 AM</Text>
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-black text-gray-900">45.2</Text>
                <Text className="text-gray-500 text-sm ml-0.5 font-bold">m³</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full gap-1">
              <Feather name="alert-triangle" size={12} color="#B91C1C" />
              <Text className="text-red-700 text-xs font-bold">High usage</Text>
            </View>
          </View>

          {/* Item 3 */}
          <View className="bg-white p-5 rounded-2xl border border-gray-100 flex-row justify-between items-center shadow-sm">
            <View>
              <Text className="text-gray-400 text-xs font-semibold mb-1">Oct 22, 2024 • 08:00 AM</Text>
              <View className="flex-row items-baseline">
                <Text className="text-2xl font-black text-gray-900">11.8</Text>
                <Text className="text-gray-500 text-sm ml-0.5 font-bold">m³</Text>
              </View>
            </View>
            <View className="flex-row items-center bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full gap-1">
              <Feather name="check" size={12} color="#15803D" />
              <Text className="text-green-700 text-xs font-bold">Normal usage</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}