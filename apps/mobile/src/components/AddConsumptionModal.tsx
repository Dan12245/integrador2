import React from "react";
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import DatePickerGrid from "./DatePickerGrid";
import MonthPickerGrid from "./MonthPickerGrid";

export interface AddConsumptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodType: "Day" | "Month";
  setPeriodType: (type: "Day" | "Month") => void;
  amountInput: string;
  setAmountInput: (val: string) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  calendarViewDate: Date;
  setCalendarViewDate: (d: Date) => void;
  todayDateObj: Date;
  currentYear: number;
  currentMonth: number;
  onSave: () => void;
}

export function AddConsumptionModal({
  isOpen,
  onClose,
  periodType,
  setPeriodType,
  amountInput,
  setAmountInput,
  selectedDate,
  setSelectedDate,
  calendarViewDate,
  setCalendarViewDate,
  todayDateObj,
  currentYear,
  currentMonth,
  onSave,
}: AddConsumptionModalProps) {
  return (
    <Modal
      testID="add-consumption-modal"
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100">
          {/* Modal Header */}
          <View className="flex-row justify-between items-center mb-5">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center">
                <Feather name="droplet" size={18} color="#0284C7" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Add Water Consumption</Text>
            </View>
            <Pressable
              testID="close-modal-button"
              onPress={onClose}
              className="p-1 rounded-full active:bg-gray-100"
            >
              <Feather name="x" size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            {/* Period selection (Day, Month) */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Consumption Type</Text>
            <View className="flex-row bg-gray-100 p-1.5 rounded-xl mb-5">
              {(["Day", "Month"] as const).map((type) => (
                <Pressable
                  key={type}
                  testID={`consumption-period-${type.toLowerCase()}`}
                  onPress={() => {
                    setPeriodType(type);
                    if (selectedDate.getTime() > todayDateObj.getTime()) {
                      setSelectedDate(new Date());
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-lg items-center ${periodType === type ? "bg-slate-900 shadow-xs" : ""}`}
                >
                  <Text className={`text-xs font-bold ${periodType === type ? "text-white" : "text-gray-600"}`}>
                    Per {type}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Amount input */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Consumption Amount (m³)</Text>
            <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 mb-5">
              <Feather name="hash" size={16} color="#9CA3AF" />
              <TextInput
                testID="consumption-amount-input"
                value={amountInput}
                onChangeText={setAmountInput}
                placeholder="Enter value in m³ (e.g. 15.5)"
                keyboardType="decimal-pad"
                className="flex-1 ml-2 text-sm text-gray-900 font-semibold"
              />
            </View>

            {/* Calendar Date / Month Picker */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              {periodType === "Day" ? "Select Date" : "Select Month"}
            </Text>

            {periodType === "Day" ? (
              <DatePickerGrid
                viewDate={calendarViewDate}
                setViewDate={setCalendarViewDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                todayDateObj={todayDateObj}
                currentYear={currentYear}
                currentMonth={currentMonth}
                testIDPrefix="calendar"
              />
            ) : (
              <MonthPickerGrid
                viewDate={calendarViewDate}
                setViewDate={setCalendarViewDate}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentYear={currentYear}
                currentMonth={currentMonth}
                testIDPrefix="calendar"
                activeColor="blue"
              />
            )}

            {/* Modal Actions */}
            <View className="flex-row gap-3 mt-2">
              <Pressable
                testID="close-modal-button"
                onPress={onClose}
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
              >
                <Text className="text-gray-700 text-xs font-bold">Cancel</Text>
              </Pressable>

              <Pressable
                testID="save-consumption-button"
                onPress={onSave}
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center active:bg-blue-700"
              >
                <Text className="text-white text-xs font-bold">Save Consumption</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default AddConsumptionModal;
