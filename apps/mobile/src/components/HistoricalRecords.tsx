import React from "react";
import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";

export interface HistoricalRecordsProps {
  selectedBuilding?: string;
  records?: Record<string, number>;
}

export default function HistoricalRecords({
  selectedBuilding = "Main Complex",
  records = {},
}: HistoricalRecordsProps) {
  // Extract and sort consumption records for the selected building
  const entries = Object.entries(records)
    .filter(([key, val]) => key.startsWith(`${selectedBuilding}:`) && val > 0)
    .map(([key, val]) => {
      const dateStr = key.replace(`${selectedBuilding}:`, "");
      const [yearStr, monthStr, dayStr] = dateStr.split("-");
      const dateObj = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, parseInt(dayStr, 10));
      return {
        key,
        dateObj,
        val: Math.round(val * 10) / 10,
      };
    })
    .sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

  return (
    <View className="mt-8 mb-12">
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className="w-1.5 h-6 bg-blue-600 rounded-full mr-3" />
          <Text className="text-xl font-extrabold text-gray-900">Historical records</Text>
        </View>
        {entries.length > 0 && (
          <View className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            <Text className="text-xs font-bold text-gray-600">{entries.length} records</Text>
          </View>
        )}
      </View>

      {/* Container Box with Internal Scroll */}
      <View className="bg-white rounded-3xl p-4 md:p-5 border border-gray-100 shadow-sm">
        {entries.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Feather name="inbox" size={32} color="#9CA3AF" className="mb-2" />
            <Text className="text-gray-600 text-sm font-semibold text-center">
              No consumption records registered yet
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              Add consumption data above for {selectedBuilding} to view history.
            </Text>
          </View>
        ) : (
          <ScrollView
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: 390 }}
            contentContainerStyle={{ gap: 12, paddingRight: 4 }}
          >
            {entries.map((item) => {
              const formattedDate = item.dateObj.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const isHighUsage = item.val > 30;

              return (
                <View
                  key={item.key}
                  className="bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200/80 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-gray-400 text-xs font-semibold mb-1">
                      {formattedDate}
                    </Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-2xl font-black text-gray-900">
                        {item.val.toFixed(1)}
                      </Text>
                      <Text className="text-gray-500 text-sm ml-0.5 font-bold">m³</Text>
                    </View>
                  </View>

                  {isHighUsage ? (
                    <View className="flex-row items-center bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full gap-1">
                      <Feather name="alert-triangle" size={12} color="#B91C1C" />
                      <Text className="text-red-700 text-xs font-bold">High usage</Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full gap-1">
                      <Feather name="check" size={12} color="#15803D" />
                      <Text className="text-green-700 text-xs font-bold">Normal usage</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
