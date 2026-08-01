import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import FeedbackForm from "../../components/FeedbackForm";
import AIChatBubble from "../../components/AIChatBubble";

export default function TechSupport() {
    const router = useRouter();

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={["top", "left", "right", "bottom"]}>
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                className="flex-1 p-4"
                showsVerticalScrollIndicator={false}
            >
                <View className="max-w-3xl w-full mx-auto">
                    <View className="py-2 items-center mb-2">
                        <Text className="text-2xl font-bold text-[#333]">Tech Support</Text>
                    </View>

                    {/* Navigation Links */}
                    <View className="mt-6 gap-2.5">
                        <TouchableOpacity
                            testID="techsupport-user-profile-button"
                            className="bg-[#2089dc] rounded-xl p-3.5 items-center"
                            onPress={() => router.push("/userProfile" as any)}
                        >
                            <Text className="text-white text-base font-semibold">
                                Go to User Profile
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="techsupport-my-buildings-button"
                            className="bg-[#2089dc] rounded-xl p-3.5 items-center"
                            onPress={() => router.push("/myBuildings" as any)}
                        >
                            <Text className="text-white text-base font-semibold">
                                Go to My Buildings
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="techsupport-consumptions-button"
                            className="bg-[#2089dc] rounded-xl p-3.5 items-center"
                            onPress={() => router.push("/consumptions" as any)}
                        >
                            <Text className="text-white text-base font-semibold">
                                Go to Consumptions
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="techsupport-back-home-button"
                            className="bg-[#86939e] rounded-xl p-3.5 items-center mt-2"
                            onPress={() => router.push("/home" as any)}
                        >
                            <Text className="text-white text-base font-semibold">Back to Home</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Feedback Form */}
                    <FeedbackForm />
                </View>
            </ScrollView>

            {/* Volatile AI Assistant Floating Chat Widget */}
            <AIChatBubble />
        </SafeAreaView>
    );
}

