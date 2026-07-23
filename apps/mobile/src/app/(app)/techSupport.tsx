import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function TechSupport() {
  const router = useRouter();

  return (
    <View className="mt-10 p-3">
      <View className="py-1 self-stretch items-center mb-5">
        <Text className="text-2xl font-bold text-[#333]">techSupport</Text>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="techsupport-user-profile-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/userProfile" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to User Profile</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="techsupport-my-buildings-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/myBuildings" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to My Buildings</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="techsupport-consumptions-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/consumptions" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity
          testID="techsupport-back-home-button"
          className="bg-[#86939e] rounded p-3 items-center"
          onPress={() => router.push("/home" as any)}
        >
          <Text className="text-white text-base font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
