import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-chart-kit/v2";
import { Feather } from "@expo/vector-icons";

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

export function ConsumptionsChart({ data, width, height }: { data: { label: string; value: number }[]; width?: number; height?: number }) {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = width || Math.min(windowWidth - 96, 1150);
  const isLargeScreen = windowWidth >= 1024;
  const chartHeight = height || (isLargeScreen ? 350 : 200);

  return (
    <BarChart
      data={data}
      xKey="label"
      yKey="value"
      scrollable
      visiblePoints={7}
      width={chartWidth}
      height={chartHeight}
    />
  );
}

export interface ConsumptionGraphProps {
  selectedBuilding: string;
  setSelectedBuilding: (building: string) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

export default function ConsumptionGraph({
  selectedBuilding,
  setSelectedBuilding,
  selectedPeriod,
  setSelectedPeriod,
}: ConsumptionGraphProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const chartWidth = isLargeScreen ? Math.min(width - 96, 1150) : width - 64;

  return (
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
              className={`px-4 py-2.5 rounded-lg ${selectedPeriod === period ? "bg-white" : ""}`}
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
        <Pressable className="bg-slate-950 px-6 py-3.5 rounded-xl flex-row items-center gap-2 active:bg-slate-800">
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white text-xs font-bold">Add consumption</Text>
        </Pressable>
        <Pressable className="bg-sky-50 px-6 py-3.5 rounded-xl flex-row items-center gap-2 border border-sky-100 active:bg-sky-100">
          <Feather name="edit-2" size={14} color="#0284C7" />
          <Text className="text-sky-800 text-xs font-bold">Edit records</Text>
        </Pressable>
      </View>
    </View>
  );
}
