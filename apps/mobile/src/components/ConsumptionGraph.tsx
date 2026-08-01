import React, { useState, useMemo } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import ConsumptionsChart from "./ConsumptionsChart";
import AddConsumptionModal from "./AddConsumptionModal";
import EditRecordsModal from "./EditRecordsModal";
import { formatDateKey, getDaysInMonth, computeChartData } from "./ConsumptionHelpers";

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

  // Building-keyed consumption records (zero default)
  const [records, setRecords] = useState<Record<string, number>>({});

  // Modal & form states for Add Consumption
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [periodType, setPeriodType] = useState<"Day" | "Month">("Day");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());

  // Modal & form states for Edit / Delete Records
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editMode, setEditMode] = useState<"Day" | "Month">("Day");
  const [editSelectedDate, setEditSelectedDate] = useState<Date>(new Date());
  const [editCalendarViewDate, setEditCalendarViewDate] = useState<Date>(new Date());
  const [editAmountInput, setEditAmountInput] = useState("");
  const [confirmDeleteMonth, setConfirmDeleteMonth] = useState(false);

  const chartData = useMemo(
    () => computeChartData(selectedPeriod, selectedBuilding, records),
    [selectedPeriod, selectedBuilding, records]
  );

  // Dates for constraints
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);
  const currentYear = todayDateObj.getFullYear();
  const currentMonth = todayDateObj.getMonth();

  const handleOpenModal = () => {
    const today = new Date();
    setSelectedDate(today);
    setCalendarViewDate(today);
    setAmountInput("");
    setPeriodType("Day");
    setIsModalOpen(true);
  };

  const handleSaveConsumption = () => {
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0) return;

    const updatedRecords = { ...records };

    if (periodType === "Day") {
      const key = `${selectedBuilding}:${formatDateKey(selectedDate)}`;
      updatedRecords[key] = (updatedRecords[key] || 0) + val;
    } else if (periodType === "Month") {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInM = getDaysInMonth(year, month);
      const perDay = val / daysInM;
      for (let d = 1; d <= daysInM; d++) {
        const key = `${selectedBuilding}:${formatDateKey(new Date(year, month, d))}`;
        updatedRecords[key] = (updatedRecords[key] || 0) + perDay;
      }
    }

    setRecords(updatedRecords);
    setIsModalOpen(false);
    setAmountInput("");
  };

  const handleOpenEditModal = () => {
    const today = new Date();
    setEditSelectedDate(today);
    setEditCalendarViewDate(today);
    setEditMode("Day");
    const currentVal = records[`${selectedBuilding}:${formatDateKey(today)}`] || 0;
    setEditAmountInput(currentVal > 0 ? String(currentVal) : "");
    setConfirmDeleteMonth(false);
    setIsEditModalOpen(true);
  };

  return (
    <View className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 mt-4">
      {/* Top Header & Building Selector */}
      <View className="flex-row flex-wrap justify-between items-center">
        <View>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">Selected Building</Text>
          <Pressable testID="select-building-button" className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 py-3 bg-gray-50">
            <Text className="text-gray-900 text-sm font-semibold">{selectedBuilding}</Text>
            <Feather name="chevron-down" size={16} color="#6B7280" />
          </Pressable>
        </View>

        {/* Timeframe group */}
        <View className="flex-row bg-gray-100 p-2 mt-8 rounded-xl">
          {["Week", "Month", "Year"].map((period) => (
            <Pressable
              testID={`select-period-${period.toLowerCase()}-button`}
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
        <ConsumptionsChart data={chartData} width={chartWidth} />
      </View>

      {/* Action Buttons under chart */}
      <View className="flex-row justify-center items-center gap-3 mt-6 flex-wrap">
        <Pressable
          testID="add-consumption-button"
          onPress={handleOpenModal}
          className="bg-slate-950 px-6 py-3.5 rounded-xl flex-row items-center gap-2 active:bg-slate-800"
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white text-xs font-bold">Add consumption</Text>
        </Pressable>

        <Pressable
          testID="edit-records-button"
          onPress={handleOpenEditModal}
          className="bg-sky-50 px-6 py-3.5 rounded-xl flex-row items-center gap-2 border border-sky-100 active:bg-sky-100"
        >
          <Feather name="edit-2" size={14} color="#0284C7" />
          <Text className="text-sky-800 text-xs font-bold">Edit records</Text>
        </Pressable>
      </View>

      {/* Emergent Window for Adding Water Consumption */}
      <AddConsumptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        periodType={periodType}
        setPeriodType={setPeriodType}
        amountInput={amountInput}
        setAmountInput={setAmountInput}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        calendarViewDate={calendarViewDate}
        setCalendarViewDate={setCalendarViewDate}
        todayDateObj={todayDateObj}
        currentYear={currentYear}
        currentMonth={currentMonth}
        onSave={handleSaveConsumption}
      />

      {/* Emergent Window for Editing or Deleting Records */}
      <EditRecordsModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        editMode={editMode}
        setEditMode={setEditMode}
        editSelectedDate={editSelectedDate}
        setEditSelectedDate={setEditSelectedDate}
        editCalendarViewDate={editCalendarViewDate}
        setEditCalendarViewDate={setEditCalendarViewDate}
        editAmountInput={editAmountInput}
        setEditAmountInput={setEditAmountInput}
        confirmDeleteMonth={confirmDeleteMonth}
        setConfirmDeleteMonth={setConfirmDeleteMonth}
        records={records}
        setRecords={setRecords}
        selectedBuilding={selectedBuilding}
        todayDateObj={todayDateObj}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </View>
  );
}
