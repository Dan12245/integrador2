import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function Index_Start_Message() {
    const router = useRouter();

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center"}}>

                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="text-6xl font-semibold text-[#1e90ff] text-center mb-2">
                        Improve the world,
                    </Text>
                    <Text className="text-6xl font-semibold text-[#1e90ff] text-center mb-2">
                        with awareness.
                    </Text>
                    
                </View>

            <TouchableOpacity
                className="rounded-xl items-center"
                style={{ backgroundColor: "#1e90ff", paddingVertical: 30, paddingHorizontal: 50 }}
                onPress={() => router.push("/login" as any)}
            >
                <Text className="text-[#051b32] text-3xl font-semibold">Start now</Text>
            </TouchableOpacity>

        </View>
    );
}