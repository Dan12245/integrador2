import React, { useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";
import ConsumptionCards from "../../components/ConsumptionCards";
import ConsumptionGraph from "../../components/ConsumptionGraph";
import HistoricalRecords from "../../components/HistoricalRecords";

export default function ConsumptionsScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState("Main Complex");
  const [selectedPeriod, setSelectedPeriod] = useState("Week");
  const [reportType, setReportType] = useState("Monthly");
  const [records, setRecords] = useState<Record<string, number>>({});

  return (
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 md:p-8 flex-1 w-full max-w-7xl mx-auto">
          <Animated.View entering={FadeInDown.delay(50).springify()}>
            <ConsumptionCards
              reportType={reportType}
              setReportType={setReportType}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).springify()}>
            <ConsumptionGraph 
              selectedBuilding={selectedBuilding} 
              setSelectedBuilding={setSelectedBuilding} 
              selectedPeriod={selectedPeriod} 
              setSelectedPeriod={setSelectedPeriod} 
              records={records}
              setRecords={setRecords}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(250).springify()}>
            <HistoricalRecords 
              selectedBuilding={selectedBuilding}
              records={records}
            />
          </Animated.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}



