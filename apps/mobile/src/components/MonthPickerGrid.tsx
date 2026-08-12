import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SHORT_MONTH_NAMES } from "./ConsumptionHelpers";

export interface MonthPickerGridProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  currentYear: number;
  currentMonth: number;
  testIDPrefix?: string;
  activeColor?: "blue" | "red";
}

export function MonthPickerGrid({
  viewDate,
  setViewDate,
  selectedDate,
  onSelectDate,
  currentYear,
  currentMonth,
  testIDPrefix = "calendar",
  activeColor = "blue",
}: MonthPickerGridProps) {
  const { t } = useTranslation();
  const viewYear = viewDate.getFullYear();

  const prevYear = () => setViewDate(new Date(viewYear - 1, viewDate.getMonth(), 1));
  const nextYear = () => {
    if (viewYear < currentYear) {
      setViewDate(new Date(viewYear + 1, viewDate.getMonth(), 1));
    }
  };

  const selectedColorClass = activeColor === "red" ? "bg-red-600 border-red-600" : "bg-blue-600 border-blue-600";

  return (
    <View className="border border-gray-200 rounded-2xl p-4 bg-gray-50 mb-5">
      {/* Year Navigator */}
      <View className="flex-row justify-between items-center mb-4">
        <Pressable testID={`${testIDPrefix}-prev-year`} onPress={prevYear} className="p-1.5 rounded-lg active:bg-gray-200">
          <Feather name="chevron-left" size={18} color="#374151" />
        </Pressable>
        <Text className="text-base font-bold text-gray-900">{viewYear}</Text>
        <Pressable
          testID={`${testIDPrefix}-next-year`}
          onPress={nextYear}
          disabled={viewYear >= currentYear}
          className={`p-1.5 rounded-lg ${viewYear >= currentYear ? "opacity-30" : "active:bg-gray-200"}`}
        >
          <Feather name="chevron-right" size={18} color="#374151" />
        </Pressable>
      </View>

      {/* 12 Months Grid */}
      <View className="flex-row flex-wrap justify-between gap-y-2.5">
        {SHORT_MONTH_NAMES.map((mName, mIdx) => {
          const isFutureMonth = viewYear > currentYear || (viewYear === currentYear && mIdx > currentMonth);
          const isSelectedMonth = selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === mIdx;
          const isCurrentMonth = viewYear === currentYear && mIdx === currentMonth;

          return (
            <Pressable
              key={mName}
              testID={`${testIDPrefix}-month-${mIdx}`}
              disabled={isFutureMonth}
              onPress={() => onSelectDate(new Date(viewYear, mIdx, 1))}
              className={`w-[30%] py-3 rounded-xl items-center border ${
                isFutureMonth
                  ? "opacity-25 bg-gray-100 border-gray-200"
                  : isSelectedMonth
                  ? selectedColorClass
                  : isCurrentMonth
                  ? "bg-blue-50 border-blue-400"
                  : "bg-white border-gray-200 active:bg-gray-100"
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  isFutureMonth
                    ? "text-gray-400"
                    : isSelectedMonth
                    ? "text-white"
                    : isCurrentMonth
                    ? "text-blue-700"
                    : "text-gray-800"
                }`}
              >
                {t(`pickers.monthsShort.${mIdx}`)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Selected month indicator */}
      <View className="mt-4 pt-3 border-t border-gray-200 flex-row items-center justify-between">
        <Text className="text-xs text-gray-500 font-medium">{t("pickers.selectedMonth")}</Text>
        <Text className="text-xs font-bold text-blue-600">
          {t(`pickers.monthsShort.${selectedDate.getMonth()}`)} {selectedDate.getFullYear()}
        </Text>
      </View>
    </View>
  );
}

export default MonthPickerGrid;
