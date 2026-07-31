import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import ConsumptionCards from "../../components/ConsumptionCards";
import ConsumptionGraph from "../../components/ConsumptionGraph";
import HistoricalRecords from "../../components/HistoricalRecords";

export default function ConsumptionsScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState("Main Complex");
  const [selectedPeriod, setSelectedPeriod] = useState("Month");
  const [reportType, setReportType] = useState("Monthly");
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-4 md:p-8  flex-1 w-full max-w-7xl mx-auto">
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            <TouchableOpacity
              testID="consumptions-back-home-button"
              style={{ backgroundColor: "#86939e", padding: 10, borderRadius: 4 }}
              onPress={() => router.push("/home")}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Back to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="consumptions-user-profile-button"
              style={{ backgroundColor: "#2089dc", padding: 10, borderRadius: 4 }}
              onPress={() => router.push("/userProfile")}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>User Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="consumptions-my-buildings-button"
              style={{ backgroundColor: "#2089dc", padding: 10, borderRadius: 4 }}
              onPress={() => router.push("/myBuildings")}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>My Buildings</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="consumptions-tech-support-button"
              style={{ backgroundColor: "#2089dc", padding: 10, borderRadius: 4 }}
              onPress={() => router.push("/techSupport")}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Tech Support</Text>
            </TouchableOpacity>
          </View>

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

