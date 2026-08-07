import React from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";

export interface ConsumptionCardsProps {
  reportType: string;
  setReportType: (type: string) => void;
}

export default function ConsumptionCards({ reportType, setReportType }: ConsumptionCardsProps) {
  const { width } = useWindowDimensions();

  //Breakpoints
  const isLargeScreen = width >= 1024;
  
  const CardTotalPeriod = (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 justify-center">
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
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0">
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
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Alerts</Text>
        <Feather name="alert-triangle" size={18} color="#EF4444" />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className="text-2xl font-extrabold text-red-600">2</Text>
        <Text className="text-red-500 text-[10px] ml-0.5 font-bold">active</Text>
      </View>
    </View>
  );

  const CardTargetVsActual = (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 justify-center">
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Target vs. Actual</Text>
        <Feather name="bar-chart-2" size={18} color="#3B82F6" />
      </View>
      <View className="flex-row items-baseline mb-2">
        <Text className="text-2xl font-extrabold text-gray-900">75%</Text>
        <Text className="text-gray-400 text-[12px] ml-1 font-semibold">used</Text>
      </View>
      <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <View className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }} />
      </View>
      <Text className="text-right text-[12px] text-gray-500 font-bold">1,245/1,660 m³</Text>
    </View>
  );

  const CardReports = (
    <View className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${isLargeScreen ? "flex-[1.5] min-w-[280px]" : "w-full mt-4"}`}>
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-1.5">
          <Feather name="file-text" size={18} color="#3B82F6" />
          <Text className="text-gray-900 text-sm font-bold">Reports</Text>
        </View>
        <View className="flex-row bg-gray-100 p-0.5 rounded-lg">
          <Pressable 
            onPress={() => setReportType("Monthly")}
            className={`px-3 py-1.5 rounded-md ${reportType === "Monthly" ? "bg-white" : ""}`}
          >
            <Text className={`text-xs font-bold ${reportType === "Monthly" ? "text-gray-900" : "text-gray-400"}`}>Monthly</Text>
          </Pressable>
          <Pressable 
            onPress={() => setReportType("Yearly")}
            className={`px-3 py-1.5 rounded-md ${reportType === "Yearly" ? "bg-white" : ""}`}
          >
            <Text className={`text-xs font-bold ${reportType === "Yearly" ? "text-gray-900" : "text-gray-400"}`}>Yearly</Text>
          </Pressable>
        </View>
      </View>
      <Pressable className="bg-slate-900 py-3.5 rounded-xl flex-row justify-center items-center gap-2 active:bg-slate-800 mt-auto">
        <Feather name="download" size={15} color="white" />
        <Text className="text-white text-xs font-bold">Download (.PDF)</Text>
      </Pressable>
    </View>
  );

  if (isLargeScreen) {
    return (
      <View className="flex-row items-stretch w-full gap-4">
        {CardTotalPeriod}
        {CardDailyAverage}
        {CardAlerts}
        {CardTargetVsActual}
        {CardReports}
      </View>
    );
  } else {
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
        {CardReports}
      </View>
    );
  }
}
