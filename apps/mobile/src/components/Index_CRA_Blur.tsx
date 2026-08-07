import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";


export default function Index_CRA_Blur() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const posthog = usePostHog();

    return (
        <View style={{ position: "relative",top: 120, alignItems: "center" }}>

            <BlurView intensity={50} tint="light" className="w-3/4 h-3/4 flex-1 justify-center p-6 bg-white rounded-2xl" style={{}}>
                
                
                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="text-9xl font-bold text-[#051b32] text-center" style={{ right: 120 }}>
                        C.R.A
                    </Text>

                    <Text className="text-4xl font-semibold text-[#051b32] text-center mb-2" style={{ right: 120 }}>
                        Helping you conserve water
                    </Text>
                                        <Text className="text-4xl font-semibold text-[#051b32] text-center mb-2" style={{ right: 120 }}>
                        One day at a time
                    </Text>
                </View>
                <Image
                            source={require("../assets/water_sphere.png")}
                            style={{
                                position: "absolute",
                                
                                left: "70%", // ajusta este valor para centrar horizontalmente
                                width: 250,
                                height: 250,
                                zIndex: 2,
                            }}
                            contentFit="cover"
                     />
            </BlurView>
        </View>
    );
}