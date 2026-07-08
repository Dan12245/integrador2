import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConsumptionCards from "../../components/ConsumptionCards";
import ConsumptionGraph from "../../components/ConsumptionGraph";
import HistoricalRecords from "../../components/HistoricalRecords";

export default function ConsumptionsScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState("Main Complex");
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [reportType, setReportType] = useState("Monthly");

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 md:p-8  flex-1 w-full max-w-7xl mx-auto">
          <ConsumptionCards 
            reportType={reportType} 
            setReportType={setReportType} 
          />
          <ConsumptionGraph 
            selectedBuilding={selectedBuilding} 
            setSelectedBuilding={setSelectedBuilding} 
            selectedPeriod={selectedPeriod} 
            setSelectedPeriod={setSelectedPeriod} 
          />
          <HistoricalRecords />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

