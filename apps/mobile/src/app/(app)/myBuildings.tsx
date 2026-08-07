import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import ReceiptScannerButton, { ExtractedData } from "../../components/Camera";

export default function MyBuildings() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  return (
    <ScrollView className="mt-10 p-3">
      <View className="py-1 self-stretch items-center mb-5">
        <Text className="text-2xl font-bold text-[#333]">myBuildings</Text>
      </View>

      <View className="mb-5">
        <ReceiptScannerButton 
          onDataExtracted={(data) => setExtractedData(data)}
          onError={(error) => console.error(error)}
        />
      </View>

      {extractedData && (
        <View className="mb-5 p-4 bg-gray-100 rounded-lg">
          <Text className="text-lg font-bold mb-2 text-[#333]">Scanned Data:</Text>
          <Text className="text-base text-gray-800">Contract: {extractedData.contract_number || 'N/A'}</Text>
          <Text className="text-base text-gray-800">Name: {extractedData.name || 'N/A'}</Text>
          <Text className="text-base text-gray-800">Address: {extractedData.address || 'N/A'}</Text>
          <Text className="text-base text-gray-800">User Type: {extractedData.user_type || 'N/A'}</Text>
          <Text className="text-base text-gray-800">Service Date: {extractedData.service_date || 'N/A'}</Text>
          <Text className="text-base text-gray-800 font-bold mt-2">Consumption: {extractedData.consumption_reading || 'N/A'}</Text>
        </View>
      )}

      <View className="py-1 self-stretch">
        <TouchableOpacity
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/userProfile" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to User Profile</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/techSupport" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Tech Support</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/consumptions" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity
          className="bg-[#86939e] rounded p-3 items-center"
          onPress={() => router.push("/home" as any)}
        >
          <Text className="text-white text-base font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
