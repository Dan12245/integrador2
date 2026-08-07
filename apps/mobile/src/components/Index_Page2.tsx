import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";


export default function Index_Start_Message() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const posthog = usePostHog();

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center", top: 40}}>

                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="text-6xl font-semibold text-[#051b32] text-center mb-2">                        
                        How does it work?
                    </Text>
                    
                </View>
            <BlurView
                intensity={50}
                tint="light"
                className="w-3/4 h-3/4 flex-col justify-between p-6 bg-white rounded-2xl gap-4"
                style={{ overflow: "hidden" }}
            >

                {/* Fila 1: cuadro izquierda, texto derecha */}
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                        <Text className="text-center">Water bills that are</Text>
                        <Text className="text-center">easier to read</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#051b32]">
                            y si te invito una copaaaaa y me acerco a tu bocaaa
                        </Text>
                    </View>
                </View>

                {/* Fila 2: cuadro derecha, texto izquierda */}
                <View style={{ flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 16 }}>
                    <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                        <Text className="text-center">Graphics, statics</Text>
                        <Text className="text-center">and dynamic</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#051b32]">
                            sabes es chistoso que estos textos no saldran asi que
                        </Text>
                    </View>
                </View>

                {/* Fila 3: cuadro izquierda, texto derecha */}
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}>
                    <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                        <Text className="text-center">Registering Multiple</Text>
                        <Text className="text-center">Addresses to Simplify</Text>
                        <Text className="text-center">Water Usage Tracking</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[#051b32]">
                            que viva las chivas y asi dos puntos uve
                        </Text>
                    </View>
                </View>

            </BlurView>
        </View>
    );
}