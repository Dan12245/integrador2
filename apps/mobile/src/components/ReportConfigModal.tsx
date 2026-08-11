import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
  Linking,
  useWindowDimensions,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getApiUrl } from "@/src/lib/api";
import { supabase } from "@/src/lib/supabase";
import { BuildingRecord } from "@/src/lib/edificios";
import { SHORT_MONTH_NAMES } from "./ConsumptionHelpers";

export interface ReportConfigModalProps {
  visible: boolean;
  onClose: () => void;
  reportType: string; // "Monthly" | "Yearly"
  buildingId: number | null;
  buildingName: string;
  buildings: BuildingRecord[];
  records: Record<string, number>;
}

export default function ReportConfigModal({
  visible,
  onClose,
  reportType,
  buildingId,
  buildingName,
  buildings,
  records,
}: ReportConfigModalProps) {
  const [scope, setScope] = useState<"single" | "all">("single");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // 0-indexed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Reset selection when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedYear(currentYear);
      setSelectedMonth(currentMonth);
      setScope(buildingId !== null ? "single" : "all");
      setError(null);
      setLoading(false);
    }
  }, [visible, buildingId, currentYear, currentMonth]);

  // Fetch available months from API when visible or buildingId/scope changes
  const [apiAvailableMonths, setApiAvailableMonths] = useState<string[]>([]);

  useEffect(() => {
    if (!visible) return;
    const fetchAvailable = async () => {
      try {
        if (scope === "single" && buildingId !== null) {
          const res = await fetch(`${getApiUrl()}/report/available-months/${buildingId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.ok && Array.isArray(json.data)) {
              const formatted = json.data.map(
                (d: { year: number; month: number }) =>
                  `${d.year}-${String(d.month).padStart(2, "0")}`
              );
              setApiAvailableMonths(formatted);
            }
          }
        } else if (scope === "all" && buildings.length > 0) {
          const allMonthsSet = new Set<string>();
          for (const b of buildings) {
            const res = await fetch(`${getApiUrl()}/report/available-months/${b.id}`);
            if (res.ok) {
              const json = await res.json();
              if (json.ok && Array.isArray(json.data)) {
                json.data.forEach((d: { year: number; month: number }) => {
                  allMonthsSet.add(`${d.year}-${String(d.month).padStart(2, "0")}`);
                });
              }
            }
          }
          setApiAvailableMonths(Array.from(allMonthsSet));
        }
      } catch (e) {
        console.log("Error fetching available months from API:", e);
      }
    };
    fetchAvailable();
  }, [visible, buildingId, scope, buildings]);

  // Determine which months have data (combining API response + local records state)
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>(apiAvailableMonths);

    const matchPrefixes: string[] = [];
    if (scope === "all") {
      buildings.forEach((b) => {
        matchPrefixes.push(`${b.id}:`);
        matchPrefixes.push(`${b.alias}:`);
      });
    } else {
      if (buildingId !== null) matchPrefixes.push(`${buildingId}:`);
      if (buildingName) matchPrefixes.push(`${buildingName}:`);
    }

    for (const [key, val] of Object.entries(records)) {
      if (val <= 0) continue;

      let dateStr = "";
      if (matchPrefixes.length > 0) {
        for (const p of matchPrefixes) {
          if (key.startsWith(p)) {
            dateStr = key.replace(p, "");
            break;
          }
        }
      } else {
        dateStr = key;
      }

      if (dateStr) {
        const parts = dateStr.split("-");
        if (parts.length >= 2) {
          const y = parts[0];
          const m = parts[1];
          monthSet.add(`${y}-${m}`);
        }
      }
    }

    return monthSet;
  }, [records, buildingId, buildingName, buildings, scope, apiAvailableMonths]);

  // Check if a given year has any data
  const yearHasData = (year: number) => {
    for (const ym of availableMonths) {
      if (ym.startsWith(`${year}-`)) return true;
    }
    return false;
  };

  // Check if a specific month has data
  const monthHasData = (year: number, monthIdx: number) => {
    const key = `${year}-${String(monthIdx + 1).padStart(2, "0")}`;
    return availableMonths.has(key);
  };

  // Get years that have data
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    for (const ym of availableMonths) {
      yearSet.add(parseInt(ym.split("-")[0], 10));
    }
    const years = Array.from(yearSet).sort((a, b) => b - a);
    // Always include current year
    if (!years.includes(currentYear)) years.unshift(currentYear);
    return years;
  }, [availableMonths, currentYear]);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const apiUrl = getApiUrl();
      let url = "";

      if (reportType === "Monthly") {
        const month = selectedMonth + 1; // Convert to 1-indexed
        if (scope === "single" && buildingId !== null) {
          url = `${apiUrl}/report/monthly/${buildingId}/${selectedYear}/${month}`;
        } else {
          // All buildings — need profile_id
          const { data: { session } } = await supabase.auth.getSession();
          const profileId = session?.user?.id;
          if (!profileId) {
            setError("You must be logged in to generate reports");
            setLoading(false);
            return;
          }
          url = `${apiUrl}/report/monthly/all/${selectedYear}/${month}?profile_id=${profileId}`;
        }
      } else {
        // Yearly
        if (scope === "single" && buildingId !== null) {
          url = `${apiUrl}/report/yearly/${buildingId}/${selectedYear}`;
        } else {
          const { data: { session } } = await supabase.auth.getSession();
          const profileId = session?.user?.id;
          if (!profileId) {
            setError("You must be logged in to generate reports");
            setLoading(false);
            return;
          }
          url = `${apiUrl}/report/yearly/all/${selectedYear}?profile_id=${profileId}`;
        }
      }

      // Open the PDF URL
      if (Platform.OS === "web") {
        window.open(url, "_blank");
      } else {
        await Linking.openURL(url);
      }

      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error("Report generation error:", err);
      setError(err.message || "Failed to generate report");
      setLoading(false);
    }
  };

  const isMonthly = reportType === "Monthly";

  // Whether the generate button should be enabled
  const canGenerate = useMemo(() => {
    if (scope === "single" && buildingId === null) return false;

    if (isMonthly) {
      return monthHasData(selectedYear, selectedMonth);
    } else {
      return yearHasData(selectedYear);
    }
  }, [scope, buildingId, isMonthly, selectedYear, selectedMonth, availableMonths]);

  const { height: windowHeight } = useWindowDimensions();
  const maxScrollHeight = Math.min(windowHeight * 0.62, 450);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-center items-center p-4"
        onPress={onClose}
      >
        <View
          style={{ width: "100%", maxWidth: 500 }}
          className="bg-white rounded-3xl p-5 md:p-6 shadow-2xl border border-gray-100 flex-col"
        >
          {/* Header */}
          <View style={{ flexShrink: 0 }} className="flex-row justify-between items-center mb-4 pb-1">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-blue-50 justify-center items-center">
                <Feather name="file-text" size={18} color="#0284C7" />
              </View>
              <Text className="text-lg font-bold text-gray-900">
                Generate {reportType} Report
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              className="p-1 rounded-full active:bg-gray-100"
            >
              <Feather name="x" size={20} color="#6B7280" />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={true}
            style={{ maxHeight: maxScrollHeight, flexGrow: 0 }}
            contentContainerStyle={{ paddingRight: 4, paddingBottom: 8 }}
          >
            {/* Scope selector */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Report scope
            </Text>
            <View className="flex-row bg-gray-100 p-1 rounded-xl mb-4">
              <Pressable
                onPress={() => setScope("single")}
                disabled={buildingId === null}
                className={`flex-1 py-2.5 rounded-lg items-center ${scope === "single" ? "bg-white" : ""} ${buildingId === null ? "opacity-40" : ""}`}
              >
                <Text className={`text-xs font-bold ${scope === "single" ? "text-gray-900" : "text-gray-400"}`}>
                  Current Building
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setScope("all")}
                className={`flex-1 py-2.5 rounded-lg items-center ${scope === "all" ? "bg-white" : ""}`}
              >
                <Text className={`text-xs font-bold ${scope === "all" ? "text-gray-900" : "text-gray-400"}`}>
                  All Buildings
                </Text>
              </Pressable>
            </View>

            {scope === "single" && (
              <View className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
                <Ionicons name="business" size={16} color="#2563EB" />
                <Text className="text-sm font-semibold text-blue-800 flex-1" numberOfLines={1}>
                  {buildingName || (buildingId !== null ? `Building #${buildingId}` : "Selected Building")}
                </Text>
              </View>
            )}

            {scope === "all" && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex-row items-center gap-2">
                <Feather name="layers" size={14} color="#D97706" />
                <Text className="text-xs font-semibold text-amber-800">
                  Report will include all {buildings.length} building{buildings.length !== 1 ? "s" : ""}
                </Text>
              </View>
            )}

            {/* Year Selector */}
            <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              Select Year
            </Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {availableYears.map((year) => {
                const hasData = yearHasData(year);
                const isSelected = year === selectedYear;

                return (
                  <Pressable
                    key={year}
                    onPress={() => setSelectedYear(year)}
                    className={`px-4 py-2 rounded-xl border ${
                      isSelected
                        ? "bg-blue-600 border-blue-600"
                        : hasData
                        ? "bg-white border-gray-200 active:bg-gray-100"
                        : "bg-gray-100 border-gray-200"
                    }`}
                    disabled={!hasData && !isSelected}
                  >
                    <Text
                      className={`text-sm font-bold ${
                        isSelected ? "text-white" : hasData ? "text-gray-800" : "text-gray-400"
                      }`}
                    >
                      {year}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Month Picker (only for Monthly reports) */}
            {isMonthly && (
              <>
                <Text className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Select Month
                </Text>
                <View className="border border-gray-200 rounded-2xl p-3 bg-gray-50 mb-4">
                  <View className="flex-row flex-wrap justify-between gap-y-2">
                    {SHORT_MONTH_NAMES.map((mName, mIdx) => {
                      const hasData = monthHasData(selectedYear, mIdx);
                      const isFutureMonth = selectedYear > currentYear ||
                        (selectedYear === currentYear && mIdx > currentMonth);
                      const isSelected = selectedMonth === mIdx;
                      const disabled = isFutureMonth || !hasData;

                      return (
                        <Pressable
                          key={mName}
                          onPress={() => setSelectedMonth(mIdx)}
                          disabled={disabled}
                          className={`w-[30%] py-2.5 rounded-xl items-center border ${
                            isSelected
                              ? "bg-blue-600 border-blue-600"
                              : hasData
                              ? "bg-white border-gray-200 active:bg-gray-100"
                              : "bg-gray-100/80 border-gray-200/60"
                          }`}
                        >
                          <Text
                            className={`text-xs ${
                              isSelected
                                ? "text-white font-bold"
                                : hasData
                                ? "text-gray-800 font-bold"
                                : "text-gray-300 font-medium"
                            }`}
                          >
                            {mName}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Selected month indicator */}
                  <View className="mt-2.5 pt-2.5 border-t border-gray-200 flex-row items-center justify-between">
                    <Text className="text-xs text-gray-500 font-medium">Selected:</Text>
                    <Text className="text-xs font-bold text-blue-600">
                      {SHORT_MONTH_NAMES[selectedMonth]} {selectedYear}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* Error display */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3 flex-row items-center gap-2">
                <Feather name="alert-circle" size={14} color="#DC2626" />
                <Text className="text-xs font-semibold text-red-700 flex-1">{error}</Text>
              </View>
            )}

            {/* No data warning */}
            {!canGenerate && (
              <View className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 flex-row items-center gap-2">
                <Feather name="info" size={14} color="#D97706" />
                <Text className="text-xs font-semibold text-amber-700">
                  No consumption data available for the selected period.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Fixed Footer Action Buttons */}
          <View style={{ flexShrink: 0 }} className="flex-row gap-3 pt-3 border-t border-gray-100 mt-2">
            <Pressable
              onPress={onClose}
              className="flex-1 bg-gray-100 py-3 rounded-xl items-center active:bg-gray-200"
            >
              <Text className="text-gray-700 text-xs font-bold">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleGenerate}
              disabled={!canGenerate || loading}
              className={`flex-1 py-3 rounded-xl items-center flex-row justify-center gap-2 ${
                canGenerate && !loading
                  ? "bg-slate-900 active:bg-slate-800"
                  : "bg-gray-300"
              }`}
            >
              {loading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Feather name="download" size={14} color="white" />
                  <Text className="text-white text-xs font-bold">Generate PDF</Text>
                </>
              )}
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}
