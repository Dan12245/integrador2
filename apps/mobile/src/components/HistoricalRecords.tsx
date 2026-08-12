import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";

export interface HistoricalRecordsProps {
  buildingId?: number | null;
  buildingName?: string;
  records?: Record<string, number>;
  abnormalThreshold?: number;
}

export default function HistoricalRecords({
  buildingId = null,
  buildingName = "Building",
  records = {},
  abnormalThreshold: propThreshold,
}: HistoricalRecordsProps) {
  const { t, i18n } = useTranslation();
  const [localThreshold, setLocalThreshold] = useState<number>(30);

  // Load custom threshold from AsyncStorage if not provided as prop
  useEffect(() => {
    if (propThreshold !== undefined) {
      setLocalThreshold(propThreshold);
      return;
    }
    if (buildingId === null) return;
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(`building_settings_${buildingId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.abnormalThreshold) {
            setLocalThreshold(parsed.abnormalThreshold);
          }
        } else {
          setLocalThreshold(30);
        }
      } catch (e) {
        console.log("Error loading building settings in HistoricalRecords:", e);
      }
    };
    loadSettings();
  }, [buildingId, propThreshold]);

  const activeThreshold = propThreshold !== undefined ? propThreshold : localThreshold;

  // Use buildingId as the key prefix if available
  const keyPrefix = buildingId !== null ? String(buildingId) : buildingName;

  // Extract and sort consumption records for the selected building
  const entries = Object.entries(records)
    .filter(([key, val]) => key.startsWith(`${keyPrefix}:`) && val > 0)
    .map(([key, val]) => {
      const dateStr = key.replace(`${keyPrefix}:`, "");
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
          <Text className="text-xl font-extrabold text-gray-900">{t("records.title")}</Text>
        </View>
        {entries.length > 0 && (
          <View className="bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
            <Text className="text-xs font-bold text-gray-600">{t("records.recordsCount", { count: entries.length })}</Text>
          </View>
        )}
      </View>

      {/* Container Box with Internal Scroll */}
      <View className="bg-white rounded-3xl p-4 md:p-5 border border-gray-100 shadow-sm">
        {buildingId === null ? (
          <View className="items-center justify-center py-8">
            <Feather name="home" size={32} color="#9CA3AF" className="mb-2" />
            <Text className="text-gray-600 text-sm font-semibold text-center">
              {t("records.selectBuildingToView")}
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              {t("records.chooseBuildingFromDropdown")}
            </Text>
          </View>
        ) : entries.length === 0 ? (
          <View className="items-center justify-center py-8">
            <Feather name="inbox" size={32} color="#9CA3AF" className="mb-2" />
            <Text className="text-gray-600 text-sm font-semibold text-center">
              {t("records.noRecordsRegistered")}
            </Text>
            <Text className="text-gray-400 text-xs text-center mt-1">
              {t("records.addConsumptionForBuilding", { buildingName })}
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
              const formattedDate = item.dateObj.toLocaleDateString(i18n.language || undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              });
              const isHighUsage = item.val > activeThreshold;

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
                      <Text className="text-red-700 text-xs font-bold">
                        {t("records.highUsage", { threshold: activeThreshold })}
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center bg-green-50 border border-green-200 px-3.5 py-1.5 rounded-full gap-1">
                      <Feather name="check" size={12} color="#15803D" />
                      <Text className="text-green-700 text-xs font-bold">{t("records.normalUsage")}</Text>
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
