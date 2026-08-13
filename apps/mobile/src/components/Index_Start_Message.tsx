import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";
import { Platform } from "react-native";



export default function Index_Start_Message() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const posthog = usePostHog();
    // dentro del componente
    const isAndroid = Platform.OS === "android";

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center"}}>

                <View className="flex flex-col  mb-8">
                    
                    <Text className="text-6xl font-semibold text-[#1e90ff] text-center mb-2">
                        Improve the world
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