import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View className="mt-10 p-3">
      <View className="py-1 self-stretch items-center mb-5">
        <Text className="text-2xl font-bold text-[#333]">Home</Text>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="home-my-buildings-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/myBuildings" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to My Buildings</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="home-tech-support-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/techSupport" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Tech Support</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          testID="home-consumptions-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/consumptions" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity
          testID="home-user-profile-button"
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/userProfile" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to User Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

