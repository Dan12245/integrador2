import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function HistoricalRecords() {
  return (
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
  );
}
