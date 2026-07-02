import React from "react";
import {  Text } from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import { ConsumptionsChart } from "../../components/Consumptions";

export default function ConsumptionsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ConsumptionsChart />
    </SafeAreaView>
  );
}
