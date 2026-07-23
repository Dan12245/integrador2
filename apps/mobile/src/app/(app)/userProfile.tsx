import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function UserProfile() {
  const router = useRouter();

  return (
    <View className="mt-10 p-3">
      <View className="py-1 self-stretch items-center mb-5">
        <Text className="text-2xl font-bold text-[#333]">userProfile</Text>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="userprofile-my-buildings-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/myBuildings" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to My Buildings</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="userprofile-tech-support-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/techSupport" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Tech Support</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="userprofile-consumptions-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/consumptions" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity
          testID="userprofile-back-home-button"
          className="bg-[#86939e] rounded p-3 items-center"
          onPress={() => router.push("/home" as any)}
        >
          <Text className="text-white text-base font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
