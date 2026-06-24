import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { CartesianChart, Line, Area } from "victory-native";

//Data plotted on the chart
const DATA = [
  { year: "January", consumption: 50 },
  { year: "February", consumption: 70 },
  { year: "March", consumption: 330 },
  { year: "April", consumption: 130 },
  { year: "May", consumption: 320 },
  { year: "June", consumption: 200 },
];

export default function Consumptions() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("Year");
  const selectedBuilding = "Main Complex";

  return (
    <ScrollView className="flex-1 bg-white px-4 py-6">
      {/* Header */}
      <View className="mb-6 mt-2">
        <Text className="text-2xl font-bold text-gray-900">Consumptions section</Text>
      </View>

      {/* Stats Cards (Safe Flexbox Layout) */}
      <View className="flex-row flex-wrap -mx-1 mb-4">
        {/* Total period */}
        <View className="w-1/2 p-1">
          <View className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <Text className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total Period</Text>
            <Text className="text-lg font-bold text-gray-900 mt-1">1,245 m³</Text>
          </View>
        </View>

        {/* Daily average */}
        <View className="w-1/2 p-1">
          <View className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <Text className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Daily Average</Text>
            <Text className="text-lg font-bold text-gray-900 mt-1">41.5 m³</Text>
          </View>
        </View>

        {/* Alerts */}
        <View className="w-1/2 p-1">
          <View className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <Text className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Alerts</Text>
            <Text className="text-lg font-bold text-red-600 mt-1">2 active</Text>
          </View>
        </View>

        {/* Target vs Actual */}
        <View className="w-1/2 p-1">
          <View className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <Text className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Target vs Actual</Text>
            <Text className="text-lg font-bold text-indigo-600 mt-1">75% used</Text>
          </View>
        </View>
      </View>

      {/* Controls */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="bg-gray-100 px-3 py-2 rounded-lg">
          <Text className="text-xs font-semibold text-gray-700">{selectedBuilding}</Text>
        </View>

        {/* Timeframe selector */}
        <View className="flex-row bg-gray-100 p-1 rounded-lg">
          {["Week", "Month", "Year"].map((tf) => (
            <TouchableOpacity
              key={tf}
              onPress={() => setSelectedTimeframe(tf)}
              className={`px-3 py-1.5 rounded-md ${
                selectedTimeframe === tf ? "bg-white shadow-sm" : ""
              }`}
            >
              <Text
                className={`text-[10px] font-bold ${
                  selectedTimeframe === tf ? "text-gray-900" : "text-gray-500"
                }`}
              >
                {tf}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Chart Container */}
      <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
          Water Consumption (m³)
        </Text>
        
        {/* Simple Victory Native Chart */}
        <View style={{ height: 180 }}>
          <CartesianChart data={DATA} xKey="year" yKeys={["consumption"]}>
            {({ points, chartBounds }) => (
              <>
                <Area
                  points={points.consumption}
                  y0={chartBounds.bottom}
                  color="rgba(32, 137, 220, 0.15)"
                />
                <Line
                  points={points.consumption}
                  color="#2089dc"
                  strokeWidth={3}
                />
              </>
            )}
          </CartesianChart>
        </View>

        {/* X-Axis labels rendered manually */}
        <View className="flex-row justify-between mt-3 px-2">
          {DATA.map((d, index) => (
            <Text key={index} className="text-[10px] text-gray-400 font-semibold">
              {d.year}
            </Text>
          ))}
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2.5 mb-6">
        <TouchableOpacity className="flex-1 bg-gray-900 py-3 rounded-xl items-center">
          <Text className="text-white text-xs font-bold">+ Add consumption</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 bg-sky-100 py-3 rounded-xl items-center">
          <Text className="text-sky-700 text-xs font-bold">Edit records</Text>
        </TouchableOpacity>
      </View>

      {/* Historical records header */}
      <View className="mb-3">
        <Text className="text-sm font-bold text-gray-900 uppercase tracking-wider">Historical records</Text>
      </View>

      {/* Records list */}
      <View className="mb-10">
        {[
          { date: "Oct 24, 2024 • 08:00 AM", amount: "12.5 m³", status: "Normal usage", statusColor: "text-green-700 bg-green-50 border-green-200" },
          { date: "Oct 23, 2024 • 08:00 AM", amount: "45.2 m³", status: "High usage", statusColor: "text-red-700 bg-red-50 border-red-200" },
          { date: "Oct 22, 2024 • 08:00 AM", amount: "11.8 m³", status: "Normal usage", statusColor: "text-green-700 bg-green-50 border-green-200" },
        ].map((item, idx) => (
          <View key={idx} className="flex-row justify-between items-center p-3.5 bg-white border border-gray-100 rounded-xl mb-2">
            <View>
              <Text className="text-[10px] text-gray-400">{item.date}</Text>
              <Text className="text-sm font-mono font-bold text-gray-900 mt-0.5">{item.amount}</Text>
            </View>
            <View className={`px-2 py-0.5 rounded-full border ${item.statusColor}`}>
              <Text className="text-[9px] font-bold">{item.status}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
