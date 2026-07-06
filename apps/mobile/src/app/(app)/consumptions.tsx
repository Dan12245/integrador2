import React from "react";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConsumptionsDashboard from "../../components/Consumptions";

export default function ConsumptionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <ConsumptionsDashboard />
      </ScrollView>
    </SafeAreaView>
  );
}

