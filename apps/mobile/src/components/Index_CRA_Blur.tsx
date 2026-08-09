import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";
import { Platform } from "react-native";

export default function Index_CRA_Blur() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const posthog = usePostHog();
    const isAndroid = Platform.OS === "android";

    return (
        <View style={{flex: isAndroid ? 1 : -1, position: "relative",top: isAndroid ? 120 : 120, alignItems: "center" }}>

            <BlurView
                intensity={50}
                tint="light"
                className= {isAndroid ? "justify-center p-6 bg-white rounded-2xl" : "flex-1 justify-center p-6 bg-white rounded-2xl"}
                style={{
                    width: isAndroid ? "90%" : "75%",
                    height: isAndroid ? "60%" : "75%",
                }}
            >                
                
                <View className="flex flex-col gap-4 mb-8" style = {{ alignItems: "center", top: isAndroid ? -100 : 0 }}>
                    
                    <Text style={{ fontSize: isAndroid ? 90 : 128, fontWeight: "bold", color: "#051b32", textAlign: "center", right: isAndroid ? 0 : 120 }}>
                        C.R.A
                    </Text>

                    <Text style={{ fontSize: isAndroid ? 30 : 36, fontWeight: "600", color: "#051b32", textAlign: "center", marginBottom: 8, right: isAndroid ? 0 : 120 }}>
                        Helping you conserve water
                    </Text>

                    <Text style={{ fontSize: isAndroid ? 30 : 36, fontWeight: "600", color: "#051b32", textAlign: "center", marginBottom: 8, right: isAndroid ? 0 : 120 }}>
                        One day at a time
                    </Text>
                </View>
                <Image
                    source={require("../assets/water_sphere.png")}
                    style={{
                        position: isAndroid ? "absolute" : "absolute",
                        left: isAndroid ? "32%" : "70%",
                        width: isAndroid ? 150 : 250,
                        height: isAndroid ? 150 : 250,
                        top: isAndroid ? 300 : 0,
                        zIndex: 2,
                        display: isAndroid ? "flex" : "flex",  // 👈 ocúltala temporalmente en Android
                    }}
                    contentFit="cover"
                />
            </BlurView>
        </View>
    );
}