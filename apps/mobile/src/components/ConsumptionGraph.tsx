import React, { useState, useMemo } from "react";
import { View, Text, Pressable, useWindowDimensions, Modal, FlatList } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import ConsumptionsChart from "./ConsumptionsChart";
import AddConsumptionModal from "./AddConsumptionModal";
import EditRecordsModal from "./EditRecordsModal";
import { formatDateKey, getDaysInMonth, computeChartData } from "./ConsumptionHelpers";
import { BuildingRecord } from "@/src/lib/edificios";
import { upsertConsumption } from "@/src/lib/consumptions";

export interface ConsumptionGraphProps {
  buildingId: number | null;
  buildingName: string;
  buildings: BuildingRecord[];
  onSelectBuilding: (building: BuildingRecord) => void;
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  records?: Record<string, number>;
  setRecords?: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export default function ConsumptionGraph({
  buildingId,
  buildingName,
  buildings,
  onSelectBuilding,
  selectedPeriod,
  setSelectedPeriod,
  records: externalRecords,
  setRecords: externalSetRecords,
}: ConsumptionGraphProps) {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;
  const chartWidth = isLargeScreen ? Math.min(width - 96, 1150) : width - 64;

  // Building-keyed consumption records fallback
  const [internalRecords, setInternalRecords] = useState<Record<string, number>>({});
  const records = externalRecords !== undefined ? externalRecords : internalRecords;
  const setRecords = externalSetRecords !== undefined ? externalSetRecords : setInternalRecords;

  // Building picker modal
  const [showBuildingPicker, setShowBuildingPicker] = useState(false);

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

  // Use buildingId for chart data keying
  const chartKey = buildingId !== null ? buildingId : buildingName;

  const chartData = useMemo(
    () => computeChartData(selectedPeriod, chartKey, records),
    [selectedPeriod, chartKey, records]
  );

  // Dates for constraints
  const todayDateObj = new Date();
  todayDateObj.setHours(0, 0, 0, 0);
  const currentYear = todayDateObj.getFullYear();
  const currentMonth = todayDateObj.getMonth();

  const handleOpenModal = () => {
    if (buildingId === null) return;
    const today = new Date();
    setSelectedDate(today);
    setCalendarViewDate(today);
    setAmountInput("");
    setPeriodType("Day");
    setIsModalOpen(true);
  };

  const handleSaveConsumption = async () => {
    const val = parseFloat(amountInput);
    if (isNaN(val) || val <= 0 || buildingId === null) return;

    const updatedRecords = { ...records };

    if (periodType === "Day") {
      const dateKey = formatDateKey(selectedDate);
      const key = `${buildingId}:${dateKey}`;
      updatedRecords[key] = (updatedRecords[key] || 0) + val;

      // Persist to DB
      await upsertConsumption(buildingId, dateKey, updatedRecords[key]);
    } else if (periodType === "Month") {
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const daysInM = getDaysInMonth(year, month);

      const isCurrentMonth =
        year === todayDateObj.getFullYear() && month === todayDateObj.getMonth();
      const daysToDistribute = isCurrentMonth ? todayDateObj.getDate() : daysInM;

      const perDay = val / daysToDistribute;
      for (let d = 1; d <= daysToDistribute; d++) {
        const dateKey = formatDateKey(new Date(year, month, d));
        const key = `${buildingId}:${dateKey}`;
        updatedRecords[key] = (updatedRecords[key] || 0) + perDay;

        // Persist each day to DB
        await upsertConsumption(buildingId, dateKey, updatedRecords[key]);
      }
    }

    setRecords(updatedRecords);
    setIsModalOpen(false);
    setAmountInput("");
  };

  const handleOpenEditModal = () => {
    if (buildingId === null) return;
    const today = new Date();
    setEditSelectedDate(today);
    setEditCalendarViewDate(today);
    setEditMode("Day");
    const currentVal = records[`${buildingId}:${formatDateKey(today)}`] || 0;
    setEditAmountInput(currentVal > 0 ? String(currentVal) : "");
    setConfirmDeleteMonth(false);
    setIsEditModalOpen(true);
  };

  const periodOptions = [
    { key: "Week", label: t("charts.periods.week") },
    { key: "Month", label: t("charts.periods.month") },
    { key: "Year", label: t("charts.periods.year") },
  ];

  return (
    <View className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 mt-4">
      {/* Top Header & Building Selector */}
      <View className="flex-row flex-wrap justify-between items-center">
        <View>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">{t("charts.selectedBuilding")}</Text>
          <Pressable
            testID="select-building-button"
            onPress={() => setShowBuildingPicker(true)}
            className="flex-row items-center justify-between border border-gray-200 rounded-xl px-3 py-3 bg-gray-50 min-w-[200px]"
          >
            <Text className="text-gray-900 text-sm font-semibold" numberOfLines={1}>
              {buildingId !== null ? buildingName : t("charts.selectBuildingPlaceholder")}
            </Text>
            <Feather name="chevron-down" size={16} color="#6B7280" />
          </Pressable>
        </View>

        {/* Timeframe group */}
        <View className="flex-row bg-gray-100 p-2 mt-8 rounded-xl">
          {periodOptions.map(({ key, label }) => (
            <Pressable
              testID={`select-period-${key.toLowerCase()}-button`}
              key={key}
              onPress={() => setSelectedPeriod(key)}
              className={`px-4 py-2.5 rounded-lg ${selectedPeriod === key ? "bg-white" : ""}`}
            >
              <Text className={`text-xs font-bold ${selectedPeriod === key ? "text-gray-900" : "text-gray-400"}`}>
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Chart container */}
      <View className="items-center justify-center py-4 w-full overflow-hidden">
        {buildingId !== null ? (
          <ConsumptionsChart data={chartData} width={chartWidth} />
        ) : (
          <View className="items-center justify-center py-12">
            <Feather name="bar-chart-2" size={40} color="#D1D5DB" />
            <Text className="text-gray-400 text-sm font-semibold mt-3">
              {t("charts.noBuildingSelected")}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons under chart */}
      <View className="flex-row justify-center items-center gap-3 mt-6 flex-wrap">
        <Pressable
          testID="add-consumption-button"
          onPress={handleOpenModal}
          className={`px-6 py-3.5 rounded-xl flex-row items-center gap-2 ${buildingId !== null ? "bg-slate-950 active:bg-slate-800" : "bg-gray-300"}`}
          disabled={buildingId === null}
        >
          <Feather name="plus" size={16} color="white" />
          <Text className="text-white text-xs font-bold">{t("charts.addConsumption")}</Text>
        </Pressable>
        <Pressable
          testID="edit-records-button"
          onPress={handleOpenEditModal}
          className={`px-6 py-3.5 rounded-xl flex-row items-center gap-2 border ${buildingId !== null ? "bg-sky-50 border-sky-100 active:bg-sky-100" : "bg-gray-100 border-gray-200"}`}
          disabled={buildingId === null}
        >
          <Feather name="edit-2" size={14} color={buildingId !== null ? "#0284C7" : "#9CA3AF"} />
          <Text className={`text-xs font-bold ${buildingId !== null ? "text-sky-800" : "text-gray-400"}`}>{t("charts.editRecords")}</Text>
        </Pressable>
      </View>

      {/* Building Picker Modal */}
      <Modal
        visible={showBuildingPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBuildingPicker(false)}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center p-4"
          onPress={() => setShowBuildingPicker(false)}
        >
          <Pressable className="bg-white w-full max-w-sm rounded-2xl p-5 shadow-2xl border border-gray-100">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-gray-900">{t("charts.selectBuildingTitle")}</Text>
              <Pressable onPress={() => setShowBuildingPicker(false)} className="p-1">
                <Feather name="x" size={20} color="#6B7280" />
              </Pressable>
            </View>

            {buildings.length === 0 ? (
              <View className="items-center py-8">
                <Feather name="home" size={32} color="#D1D5DB" />
                <Text className="text-gray-500 text-sm font-semibold mt-3">{t("charts.noBuildingsFound")}</Text>
                <Text className="text-gray-400 text-xs mt-1">{t("charts.addBuildingsFirst")}</Text>
              </View>
            ) : (
              <FlatList
                data={buildings}
                keyExtractor={(item) => String(item.id)}
                style={{ maxHeight: 350 }}
                renderItem={({ item }) => (
                  <Pressable
                    onPress={() => {
                      onSelectBuilding(item);
                      setShowBuildingPicker(false);
                    }}
                    className={`p-4 rounded-xl mb-2 flex-row items-center justify-between ${
                      buildingId === item.id
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <View className="flex-1 mr-3">
                      <Text className="text-gray-900 text-sm font-bold">{item.alias}</Text>
                      <Text className="text-gray-500 text-xs mt-0.5" numberOfLines={1}>
                        {item.address || t("charts.noAddress")}
                      </Text>
                    </View>
                    {buildingId === item.id && (
                      <Feather name="check-circle" size={18} color="#2563EB" />
                    )}
                  </Pressable>
                )}
              />
            )}
          </Pressable>
        </Pressable>
      </Modal>

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
        buildingId={buildingId}
        buildingName={buildingName}
        todayDateObj={todayDateObj}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </View>
  );
}
