import React, { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, useWindowDimensions, Modal, TextInput, ScrollView } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ReportConfigModal from "./ReportConfigModal";
import { BuildingRecord } from "@/src/lib/edificios";

export interface ConsumptionCardsProps {
  buildingId?: number | null;
  buildingName?: string;
  records?: Record<string, number>;
  reportType: string;
  setReportType: (type: string) => void;
  abnormalThreshold?: number;
  setAbnormalThreshold?: (val: number) => void;
  buildings?: BuildingRecord[];
}

export default function ConsumptionCards({
  buildingId = null,
  buildingName = "",
  records = {},
  reportType,
  setReportType,
  abnormalThreshold: externalThreshold,
  setAbnormalThreshold: externalSetThreshold,
  buildings = [],
}: ConsumptionCardsProps) {
  const { width } = useWindowDimensions();
  const isLargeScreen = width >= 1024;

  // Customizable thresholds (default: 100 m³ target, 30 m³/day alert)
  const [monthlyTarget, setMonthlyTarget] = useState<number>(100);
  const [internalThreshold, setInternalThreshold] = useState<number>(30);

  const abnormalThreshold = externalThreshold !== undefined ? externalThreshold : internalThreshold;
  const setAbnormalThreshold = externalSetThreshold !== undefined ? externalSetThreshold : setInternalThreshold;

  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [targetInput, setTargetInput] = useState("100");
  const [thresholdInput, setThresholdInput] = useState("30");

  // Load custom settings per building from AsyncStorage
  useEffect(() => {
    if (buildingId === null) return;
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(`building_settings_${buildingId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.monthlyTarget) {
            setMonthlyTarget(parsed.monthlyTarget);
            setTargetInput(String(parsed.monthlyTarget));
          }
          if (parsed.abnormalThreshold) {
            setAbnormalThreshold(parsed.abnormalThreshold);
            setThresholdInput(String(parsed.abnormalThreshold));
          }
        } else {
          setMonthlyTarget(100);
          setAbnormalThreshold(30);
          setTargetInput("100");
          setThresholdInput("30");
        }
      } catch (e) {
        console.log("Error loading building settings:", e);
      }
    };
    loadSettings();
  }, [buildingId]);

  // Current Month Calculations
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed
  const daysElapsed = today.getDate(); // 1 to 31

  // Filter records for current building and current month
  const currentMonthEntries = useMemo(() => {
    if (buildingId === null) return [];
    const prefix = `${buildingId}:${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-`;

    return Object.entries(records)
      .filter(([key, val]) => key.startsWith(prefix) && val > 0)
      .map(([key, val]) => {
        const dayStr = key.split("-")[2];
        return { day: parseInt(dayStr, 10), value: val };
      });
  }, [buildingId, records, currentYear, currentMonth]);

  // Total consumption for the current month
  const monthTotal = useMemo(() => {
    return currentMonthEntries.reduce((acc, item) => acc + item.value, 0);
  }, [currentMonthEntries]);

  // Daily average for the current month so far
  const dailyAverage = useMemo(() => {
    if (daysElapsed === 0) return 0;
    return monthTotal / daysElapsed;
  }, [monthTotal, daysElapsed]);

  // Active abnormal usage alerts in the current month
  const activeAlertsCount = useMemo(() => {
    return currentMonthEntries.filter((item) => item.value > abnormalThreshold).length;
  }, [currentMonthEntries, abnormalThreshold]);

  // Percentage of target used
  const targetPercentage = useMemo(() => {
    if (monthlyTarget <= 0) return 0;
    return Math.round((monthTotal / monthlyTarget) * 100);
  }, [monthTotal, monthlyTarget]);

  // Handle saving target & threshold configuration
  const handleSaveSettings = async () => {
    const newTarget = parseFloat(targetInput);
    const newThreshold = parseFloat(thresholdInput);

    if (!isNaN(newTarget) && newTarget > 0) {
      setMonthlyTarget(newTarget);
    }
    if (!isNaN(newThreshold) && newThreshold > 0) {
      setAbnormalThreshold(newThreshold);
    }

    if (buildingId !== null) {
      try {
        await AsyncStorage.setItem(
          `building_settings_${buildingId}`,
          JSON.stringify({
            monthlyTarget: !isNaN(newTarget) && newTarget > 0 ? newTarget : monthlyTarget,
            abnormalThreshold: !isNaN(newThreshold) && newThreshold > 0 ? newThreshold : abnormalThreshold,
          })
        );
      } catch (e) {
        console.log("Error saving building settings:", e);
      }
    }

    setIsSettingsOpen(false);
  };

  const CardTotalPeriod = (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 justify-center">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">This Month Total</Text>
        <Ionicons name="water" size={18} color="#3B82F6" />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className="text-2xl font-extrabold text-gray-900">
          {monthTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </Text>
        <Text className="text-gray-400 text-xs ml-0.5 font-bold">m³</Text>
      </View>
    </View>
  );

  const CardDailyAverage = (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 justify-center">
      <View className="flex-row justify-between items-start mb-3">
        <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Daily Average</Text>
        <Feather name="trending-up" size={18} color="#1F2937" />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className="text-2xl font-extrabold text-gray-900">
          {dailyAverage.toLocaleString(undefined, { maximumFractionDigits: 1 })}
        </Text>
        <Text className="text-gray-400 text-xs ml-0.5 font-bold">m³</Text>
      </View>
    </View>
  );

  const CardAlerts = (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 justify-center">
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-row items-center gap-1">
          <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Alerts</Text>
          <Pressable onPress={() => setIsSettingsOpen(true)} className="p-0.5">
            <Feather name="settings" size={12} color="#9CA3AF" />
          </Pressable>
        </View>
        <Feather name="alert-triangle" size={18} color={activeAlertsCount > 0 ? "#EF4444" : "#10B981"} />
      </View>
      <View className="flex-row items-baseline mt-auto">
        <Text className={`text-2xl font-extrabold ${activeAlertsCount > 0 ? "text-red-600" : "text-emerald-600"}`}>
          {activeAlertsCount}
        </Text>
        <Text className={`text-[10px] ml-1 font-bold ${activeAlertsCount > 0 ? "text-red-500" : "text-emerald-500"}`}>
          {activeAlertsCount === 1 ? "alert" : "alerts"} (&gt;{abnormalThreshold}m³)
        </Text>
      </View>
    </View>
  );

  const CardTargetVsActual = (
    <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex-1 min-w-0 justify-center">
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-row items-center gap-1">
          <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Target vs. Actual</Text>
          <Pressable onPress={() => setIsSettingsOpen(true)} className="p-0.5">
            <Feather name="edit-2" size={11} color="#9CA3AF" />
          </Pressable>
        </View>
        <Feather name="bar-chart-2" size={18} color="#3B82F6" />
      </View>
      <View className="flex-row items-baseline mb-2">
        <Text className={`text-2xl font-extrabold ${targetPercentage > 100 ? "text-red-600" : "text-gray-900"}`}>
          {targetPercentage}%
        </Text>
        <Text className="text-gray-400 text-[12px] ml-1 font-semibold">used</Text>
      </View>
      <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
        <View
          className={`h-full rounded-full ${
            targetPercentage > 100 ? "bg-red-500" : targetPercentage > 85 ? "bg-amber-500" : "bg-blue-500"
          }`}
          style={{ width: `${Math.min(targetPercentage, 100)}%` }}
        />
      </View>
      <Text className="text-right text-[11px] text-gray-500 font-bold">
        {monthTotal.toLocaleString(undefined, { maximumFractionDigits: 1 })} / {monthlyTarget} m³
      </Text>
    </View>
  );

  const CardReports = (
    <View className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 ${isLargeScreen ? "flex-[1.5] min-w-[280px]" : "w-full mt-4"}`}>
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-1.5">
          <Feather name="file-text" size={18} color="#3B82F6" />
          <Text className="text-gray-900 text-sm font-bold">Reports</Text>
        </View>
        <View className="flex-row bg-gray-100 p-0.5 rounded-lg">
          <Pressable
            testID="report-type-monthly-button"
            onPress={() => setReportType("Monthly")}
            className={`px-3 py-1.5 rounded-md ${reportType === "Monthly" ? "bg-white" : ""}`}
          >
            <Text className={`text-xs font-bold ${reportType === "Monthly" ? "text-gray-900" : "text-gray-400"}`}>Monthly</Text>
          </Pressable>
          <Pressable
            testID="report-type-yearly-button"
            onPress={() => setReportType("Yearly")}
            className={`px-3 py-1.5 rounded-md ${reportType === "Yearly" ? "bg-white" : ""}`}
          >
            <Text className={`text-xs font-bold ${reportType === "Yearly" ? "text-gray-900" : "text-gray-400"}`}>Yearly</Text>
          </Pressable>
        </View>
      </View>
      <Pressable
        testID="download-report-button"
        onPress={() => setIsReportModalOpen(true)}
        className="bg-slate-900 py-3.5 rounded-xl flex-row justify-center items-center gap-2 active:bg-slate-800 mt-auto"
      >
        <Feather name="download" size={15} color="white" />
        <Text className="text-white text-xs font-bold">Download (.PDF)</Text>
      </Pressable>
    </View>
  );

  return (
    <View className="w-full">
      {isLargeScreen ? (
        <View className="flex-row items-stretch w-full gap-4">
          {CardTotalPeriod}
          {CardDailyAverage}
          {CardAlerts}
          {CardTargetVsActual}
          {CardReports}
        </View>
      ) : (
        <View className="w-full">
          <View className="flex-row gap-3 items-stretch mb-3">
            {CardTotalPeriod}
            {CardDailyAverage}
          </View>
          <View className="flex-row gap-3 items-stretch">
            {CardAlerts}
            {CardTargetVsActual}
          </View>
          {CardReports}
        </View>
      )}

      {/* Target & Abnormal Consumption Settings Modal */}
      <Modal
        visible={isSettingsOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-center items-center p-4"
          onPress={() => setIsSettingsOpen(false)}
        >
          <Pressable className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-gray-100">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-5">
              <View className="flex-row items-center gap-2">
                <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center">
                  <Feather name="sliders" size={18} color="#0284C7" />
                </View>
                <Text className="text-lg font-bold text-gray-900">Configure Targets & Alerts</Text>
              </View>
              <Pressable onPress={() => setIsSettingsOpen(false)} className="p-1 rounded-full active:bg-gray-100">
                <Feather name="x" size={20} color="#6B7280" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Monthly Water Target (m³)
              </Text>
              <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 mb-5">
                <Feather name="target" size={16} color="#9CA3AF" />
                <TextInput
                  value={targetInput}
                  onChangeText={setTargetInput}
                  placeholder="Enter target e.g. 100"
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-sm text-gray-900 font-semibold"
                />
              </View>

              <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Abnormal Daily Threshold (m³/day)
              </Text>
              <Text className="text-[11px] text-gray-400 mb-2">
                Days with consumption higher than this value trigger an abnormal usage alert.
              </Text>
              <View className="flex-row items-center border border-gray-200 bg-gray-50 rounded-xl px-3.5 py-2.5 mb-6">
                <Feather name="alert-triangle" size={16} color="#9CA3AF" />
                <TextInput
                  value={thresholdInput}
                  onChangeText={setThresholdInput}
                  placeholder="Enter alert threshold e.g. 30"
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-sm text-gray-900 font-semibold"
                />
              </View>

              {/* Actions */}
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setIsSettingsOpen(false)}
                  className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
                >
                  <Text className="text-gray-700 text-xs font-bold">Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSaveSettings}
                  className="flex-1 bg-blue-600 py-3 rounded-xl items-center active:bg-blue-700 shadow-sm"
                >
                  <Text className="text-white text-xs font-bold">Save Settings</Text>
                </Pressable>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Report Configuration Modal */}
      <ReportConfigModal
        visible={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportType={reportType}
        buildingId={buildingId}
        buildingName={buildingName}
        buildings={buildings}
        records={records}
      />
    </View>
  );
}
