import React from "react";
import { View, Text, Pressable, Modal, TextInput, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import DatePickerGrid from "./DatePickerGrid";
import MonthPickerGrid from "./MonthPickerGrid";
import { SHORT_MONTH_NAMES, formatDateKey, getDaysInMonth } from "./ConsumptionHelpers";

export interface EditRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editMode: "Day" | "Month";
  setEditMode: (mode: "Day" | "Month") => void;
  editSelectedDate: Date;
  setEditSelectedDate: (d: Date) => void;
  editCalendarViewDate: Date;
  setEditCalendarViewDate: (d: Date) => void;
  editAmountInput: string;
  setEditAmountInput: (val: string) => void;
  confirmDeleteMonth: boolean;
  setConfirmDeleteMonth: (val: boolean) => void;
  records: Record<string, number>;
  setRecords: (records: Record<string, number>) => void;
  selectedBuilding: string;
  todayDateObj: Date;
  currentYear: number;
  currentMonth: number;
}

export function EditRecordsModal({
  isOpen,
  onClose,
  editMode,
  setEditMode,
  editSelectedDate,
  setEditSelectedDate,
  editCalendarViewDate,
  setEditCalendarViewDate,
  editAmountInput,
  setEditAmountInput,
  confirmDeleteMonth,
  setConfirmDeleteMonth,
  records,
  setRecords,
  selectedBuilding,
  todayDateObj,
  currentYear,
  currentMonth,
}: EditRecordsModalProps) {
  return (
    <Modal
      testID="edit-records-modal"
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
              <View className="w-8 h-8 rounded-full bg-sky-50 justify-center items-center">
                <Feather name="edit-2" size={18} color="#0284C7" />
              </View>
              <Text className="text-lg font-bold text-gray-900">Edit or Delete Records</Text>
            </View>
            <Pressable
              testID="close-edit-modal-button"
              onPress={onClose}
              className="p-1 rounded-full active:bg-gray-100"
            >
              <Feather name="x" size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className="max-h-[80vh]">
            {/* Mode Tabs (Edit Day vs Delete Month) */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Operation Mode</Text>
            <View className="flex-row bg-gray-100 p-1.5 rounded-xl mb-5">
              <Pressable
                testID="edit-mode-day-button"
                onPress={() => {
                  setEditMode("Day");
                  setConfirmDeleteMonth(false);
                }}
                className={`flex-1 py-2.5 rounded-lg items-center ${editMode === "Day" ? "bg-slate-900 shadow-xs" : ""}`}
              >
                <Text className={`text-xs font-bold ${editMode === "Day" ? "text-white" : "text-gray-600"}`}>
                  Edit Day Record
                </Text>
              </Pressable>

              <Pressable
                testID="edit-mode-month-button"
                onPress={() => {
                  setEditMode("Month");
                  setConfirmDeleteMonth(false);
                }}
                className={`flex-1 py-2.5 rounded-lg items-center ${editMode === "Month" ? "bg-red-600 shadow-xs" : ""}`}
              >
                <Text className={`text-xs font-bold ${editMode === "Month" ? "text-white" : "text-gray-600"}`}>
                  Delete Month
                </Text>
              </Pressable>
            </View>

            {editMode === "Day" ? (
              /* Edit by Day Section */
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Target Date</Text>
                <DatePickerGrid
                  viewDate={editCalendarViewDate}
                  setViewDate={setEditCalendarViewDate}
                  selectedDate={editSelectedDate}
                  onSelectDate={(newD) => {
                    setEditSelectedDate(newD);
                    const currentVal = records[`${selectedBuilding}:${formatDateKey(newD)}`] || 0;
                    setEditAmountInput(currentVal > 0 ? String(currentVal) : "");
                  }}
                  todayDateObj={todayDateObj}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  testIDPrefix="edit-calendar"
                  records={records}
                  building={selectedBuilding}
                />

                {/* Current record & update input */}
                <View className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mb-5">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xs font-semibold text-gray-600">Current Consumption:</Text>
                    <Text className="text-sm font-black text-gray-900">
                      {(records[`${selectedBuilding}:${formatDateKey(editSelectedDate)}`] || 0).toFixed(1)} m³
                    </Text>
                  </View>

                  <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Consumption Value (m³)</Text>
                  <View className="flex-row items-center border border-gray-200 bg-white rounded-xl px-3.5 py-2.5">
                    <Feather name="edit-3" size={16} color="#9CA3AF" />
                    <TextInput
                      testID="edit-consumption-amount-input"
                      value={editAmountInput}
                      onChangeText={setEditAmountInput}
                      placeholder="Enter updated value in m³"
                      keyboardType="decimal-pad"
                      className="flex-1 ml-2 text-sm text-gray-900 font-semibold"
                    />
                  </View>
                </View>

                {/* Actions for Day */}
                <View className="flex-row gap-3">
                  <Pressable
                    testID="delete-record-button"
                    onPress={() => {
                      const updated = { ...records };
                      delete updated[`${selectedBuilding}:${formatDateKey(editSelectedDate)}`];
                      setRecords(updated);
                      setEditAmountInput("");
                    }}
                    className="flex-1 bg-red-50 border border-red-200 py-3 rounded-xl items-center active:bg-red-100"
                  >
                    <Text className="text-red-700 text-xs font-bold">Delete Day</Text>
                  </Pressable>

                  <Pressable
                    testID="update-record-button"
                    onPress={() => {
                      const val = parseFloat(editAmountInput);
                      const updated = { ...records };
                      const key = `${selectedBuilding}:${formatDateKey(editSelectedDate)}`;
                      if (isNaN(val) || val <= 0) {
                        delete updated[key];
                      } else {
                        updated[key] = val;
                      }
                      setRecords(updated);
                      onClose();
                    }}
                    className="flex-1 bg-sky-600 py-3 rounded-xl items-center active:bg-sky-700 shadow-sm"
                  >
                    <Text className="text-white text-xs font-bold">Save Changes</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* Delete by Month Section */
              <View>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Month to Clear</Text>
                <MonthPickerGrid
                  viewDate={editCalendarViewDate}
                  setViewDate={setEditCalendarViewDate}
                  selectedDate={editSelectedDate}
                  onSelectDate={(newD) => {
                    setEditSelectedDate(newD);
                    setConfirmDeleteMonth(false);
                  }}
                  currentYear={currentYear}
                  currentMonth={currentMonth}
                  testIDPrefix="edit-calendar"
                  activeColor="red"
                />

                {/* Warning Banner */}
                <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-5 flex-row items-start gap-3">
                  <Feather name="alert-triangle" size={20} color="#DC2626" className="mt-0.5" />
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-red-900 mb-1">Warning: Irreversible Action</Text>
                    <Text className="text-xs text-red-700 leading-relaxed">
                      This action will permanently delete all water consumption records for{" "}
                      <Text className="font-bold">
                        {SHORT_MONTH_NAMES[editSelectedDate.getMonth()]} {editSelectedDate.getFullYear()}
                      </Text>{" "}
                      in <Text className="font-bold">{selectedBuilding}</Text>.
                    </Text>
                  </View>
                </View>

                {/* Confirmation Prompt or Delete Button */}
                {!confirmDeleteMonth ? (
                  <Pressable
                    testID="delete-month-button"
                    onPress={() => setConfirmDeleteMonth(true)}
                    className="w-full bg-red-600 py-3.5 rounded-xl items-center active:bg-red-700 shadow-sm flex-row justify-center gap-2"
                  >
                    <Feather name="trash-2" size={16} color="white" />
                    <Text className="text-white text-xs font-bold">Delete Month Records</Text>
                  </Pressable>
                ) : (
                  <View className="bg-red-100 border border-red-300 p-4 rounded-2xl">
                    <Text className="text-xs font-bold text-red-950 text-center mb-3">
                      Are you sure you want to delete all data for {SHORT_MONTH_NAMES[editSelectedDate.getMonth()]} {editSelectedDate.getFullYear()}?
                    </Text>
                    <View className="flex-row gap-3">
                      <Pressable
                        testID="cancel-delete-month-button"
                        onPress={() => setConfirmDeleteMonth(false)}
                        className="flex-1 bg-white border border-gray-300 py-2.5 rounded-xl items-center active:bg-gray-100"
                      >
                        <Text className="text-gray-700 text-xs font-bold">Cancel</Text>
                      </Pressable>

                      <Pressable
                        testID="confirm-delete-month-button"
                        onPress={() => {
                          const yr = editSelectedDate.getFullYear();
                          const mo = editSelectedDate.getMonth();
                          const daysInM = getDaysInMonth(yr, mo);
                          const updated = { ...records };

                          for (let d = 1; d <= daysInM; d++) {
                            const key = `${selectedBuilding}:${formatDateKey(new Date(yr, mo, d))}`;
                            delete updated[key];
                          }

                          setRecords(updated);
                          setConfirmDeleteMonth(false);
                          onClose();
                        }}
                        className="flex-1 bg-red-600 py-2.5 rounded-xl items-center active:bg-red-700 shadow-sm"
                      >
                        <Text className="text-white text-xs font-bold">Yes, Delete All</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default EditRecordsModal;
