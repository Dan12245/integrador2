import React from "react";
import { SafeAreaView } from "react-native";
import Consumptions from "../../components/Consumptions";

export default function ConsumptionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <Consumptions />
    </SafeAreaView>
  );
}
