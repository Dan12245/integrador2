import React from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { SHORT_MONTH_NAMES, getDaysInMonth, formatDateKey } from "./ConsumptionHelpers";

export interface DatePickerGridProps {
  viewDate: Date;
  setViewDate: (d: Date) => void;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  todayDateObj: Date;
  currentYear: number;
  currentMonth: number;
  testIDPrefix?: string;
  records?: Record<string, number>;
  building?: string;
}

export function DatePickerGrid({
  viewDate,
  setViewDate,
  selectedDate,
  onSelectDate,
  todayDateObj,
  currentYear,
  currentMonth,
  testIDPrefix = "calendar",
  records = {},
  building = "",
}: DatePickerGridProps) {
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();
  const daysInViewMonth = getDaysInMonth(viewYear, viewMonth);

  const prevMonth = () => setViewDate(new Date(viewYear, viewMonth - 1, 1));
  const nextMonth = () => {
    if (viewYear < currentYear || (viewYear === currentYear && viewMonth < currentMonth)) {
      setViewDate(new Date(viewYear, viewMonth + 1, 1));
    }
  };

  const isNextDisabled = viewYear > currentYear || (viewYear === currentYear && viewMonth >= currentMonth);

  return (
    <View className="border border-gray-200 rounded-2xl p-4 bg-gray-50 mb-5">
      {/* Month Navigator Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Pressable testID={`${testIDPrefix}-prev-month`} onPress={prevMonth} className="p-1.5 rounded-lg active:bg-gray-200">
          <Feather name="chevron-left" size={18} color="#374151" />
        </Pressable>
        <Text className="text-sm font-bold text-gray-900">
          {SHORT_MONTH_NAMES[viewMonth]} {viewYear}
        </Text>
        <Pressable
          testID={`${testIDPrefix}-next-month`}
          onPress={nextMonth}
          disabled={isNextDisabled}
          className={`p-1.5 rounded-lg ${isNextDisabled ? "opacity-30" : "active:bg-gray-200"}`}
        >
          <Feather name="chevron-right" size={18} color="#374151" />
        </Pressable>
      </View>

      {/* Day Headers */}
      <View className="flex-row justify-between mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
          <Text key={dayName} className="w-8 text-center text-xs font-bold text-gray-400">
            {dayName}
          </Text>
        ))}
      </View>

      {/* Days Grid */}
      <View className="flex-row flex-wrap">
        {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
          <View key={`empty-${idx}`} className="w-8 h-8 m-0.5" />
        ))}

        {Array.from({ length: daysInViewMonth }, (_, i) => i + 1).map((dayNum) => {
          const dayDate = new Date(viewYear, viewMonth, dayNum);
          dayDate.setHours(0, 0, 0, 0);

          const isFuture = dayDate.getTime() > todayDateObj.getTime();
          const isSelected =
            selectedDate.getDate() === dayNum &&
            selectedDate.getMonth() === viewMonth &&
            selectedDate.getFullYear() === viewYear;

          const isToday =
            todayDateObj.getDate() === dayNum &&
            todayDateObj.getMonth() === viewMonth &&
            todayDateObj.getFullYear() === viewYear;

          const key = building ? `${building}:${formatDateKey(dayDate)}` : "";
          const hasValue = key ? (records[key] || 0) > 0 : false;

          return (
            <Pressable
              key={`day-${dayNum}`}
              testID={`${testIDPrefix}-day-${dayNum}`}
              disabled={isFuture}
              onPress={() => onSelectDate(new Date(viewYear, viewMonth, dayNum))}
              className={`w-8 h-8 m-0.5 justify-center items-center rounded-full ${
                isFuture
                  ? "opacity-25 bg-gray-100"
                  : isSelected
                  ? testIDPrefix === "edit-calendar" ? "bg-sky-600" : "bg-blue-600"
                  : isToday
                  ? "border border-blue-500 bg-blue-50"
                  : hasValue
                  ? "border border-sky-500 bg-sky-50"
                  : "active:bg-gray-200"
              }`}
            >
              <Text
                className={`text-xs ${
                  isFuture
                    ? "text-gray-400"
                    : isSelected
                    ? "text-white font-bold"
                    : isToday
                    ? "text-blue-700 font-bold"
                    : hasValue
                    ? "text-sky-700 font-bold"
                    : "text-gray-800"
                }`}
              >
                {dayNum}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Selected date indicator */}
      <View className="mt-3 pt-3 border-t border-gray-200 flex-row items-center justify-between">
        <Text className="text-xs text-gray-500 font-medium">Selected Date:</Text>
        <Text className="text-xs font-bold text-blue-600">
          {selectedDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </Text>
      </View>
    </View>
  );
}

export default DatePickerGrid;
