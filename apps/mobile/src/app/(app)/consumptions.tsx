import React, { useState, useEffect, useCallback } from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import AppNavbar from "../../components/AppNavbar";
import ConsumptionCards from "../../components/ConsumptionCards";
import ConsumptionGraph from "../../components/ConsumptionGraph";
import HistoricalRecords from "../../components/HistoricalRecords";
import { getBuildings, BuildingRecord } from "@/src/lib/edificios";
import { fetchConsumptions, consumptionsToRecords } from "@/src/lib/consumptions";

export default function ConsumptionsScreen() {
  const { t } = useTranslation();
  const [buildings, setBuildings] = useState<BuildingRecord[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingRecord | null>(null);
  const [loadingBuildings, setLoadingBuildings] = useState(true);

  const [selectedPeriod, setSelectedPeriod] = useState("Week");
  const [reportType, setReportType] = useState("Monthly");
  const [records, setRecords] = useState<Record<string, number>>({});
  const [loadingConsumptions, setLoadingConsumptions] = useState(false);
  const [abnormalThreshold, setAbnormalThreshold] = useState<number>(30);

  // Load buildings on focus
  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        setLoadingBuildings(true);
        const data = await getBuildings();
        setBuildings(data ?? []);
        setLoadingBuildings(false);
      };
      load();
    }, [])
  );

  // Auto-select first building if none is selected
  useEffect(() => {
    if (!selectedBuilding && buildings.length > 0) {
      setSelectedBuilding(buildings[0]);
    }
  }, [buildings, selectedBuilding]);

  // Fetch consumption data whenever selected building changes
  useEffect(() => {
    if (!selectedBuilding) return;

    const loadConsumptions = async () => {
      setLoadingConsumptions(true);
      const data = await fetchConsumptions(selectedBuilding.id);
      if (data) {
        setRecords(consumptionsToRecords(selectedBuilding.id, data));
      } else {
        setRecords({});
      }
      setLoadingConsumptions(false);
    };

    loadConsumptions();
  }, [selectedBuilding?.id]);

  const handleSelectBuilding = (building: BuildingRecord) => {
    setSelectedBuilding(building);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" showsVerticalScrollIndicator={false} bottomOffset={20}>
        <View className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <ConsumptionCards
              buildingId={selectedBuilding?.id ?? null}
              buildingName={selectedBuilding?.alias ?? ""}
              records={records}
              reportType={reportType}
              setReportType={setReportType}
              abnormalThreshold={abnormalThreshold}
              setAbnormalThreshold={setAbnormalThreshold}
              buildings={buildings}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            {loadingBuildings ? (
              <View className="bg-white p-8 rounded-3xl border border-gray-100 mt-4 items-center justify-center">
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text className="text-gray-400 text-sm mt-3">{t("consumptions.loadingBuildings")}</Text>
              </View>
            ) : (
              <ConsumptionGraph
                buildingId={selectedBuilding?.id ?? null}
                buildingName={selectedBuilding?.alias ?? ""}
                buildings={buildings}
                onSelectBuilding={handleSelectBuilding}
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                records={records}
                setRecords={setRecords}
              />
            )}
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <HistoricalRecords
              buildingId={selectedBuilding?.id ?? null}
              buildingName={selectedBuilding?.alias ?? ""}
              records={records}
              abnormalThreshold={abnormalThreshold}
            />
          </Animated.View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
