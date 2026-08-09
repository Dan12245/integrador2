import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, useWindowDimensions, Platform, ScrollView } from "react-native";
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
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const isAndroid = Platform.OS !== "web";

    // Escala de fuente relativa al ancho de pantalla (base: diseño en ~1440px)
    const scale = Math.min(Math.max(SCREEN_WIDTH / 1440, 0.55), 1);

    const items = [
        {
            title: ["Water bills that are", "easier to read"],
            text: "We offer an easier and more accessible way to read your water bills without having to try to decipher all the information on a standard water bill.",
        },
        {
            title: ["Graphics, statics", "and dynamic"],
            text: "We have a graph that lets you see your water usage more visually over the course of a week, a month, or a year. It also includes sections for your typical usage, alerts for unusual usage, a history of all your bills, and the option to generate a report as a PDF file.",
        },
        {
            title: ["Registering Multiple", "Addresses"],
            text: "You can register multiple addresses in your account to easily track and manage your water usage across different locations.",
        },
    ];

    return (
        <View style={{right: isAndroid ? 35 : 0 , position: "relative", alignItems: "center", justifyContent: "center", top: isAndroid ? -50 : SCREEN_HEIGHT * 0.02}}>

                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="font-semibold text-[#051b32] text-center mb-2" style={{ fontSize: isAndroid ? 90 * scale : 60 * scale }}>                        
                        How does it work?
                    </Text>
                    
                </View>
                
                <Text className="text-[#051b32] font-semibold" style={{ width: "100%", textAlign: "center", fontSize: isAndroid ? 30 * scale : 18 * scale }}>
                    {isAndroid ? "Swipe from left to right to switch screens" : "Click the arrows to switch screens"}   
                </Text>
                <Text className="text-[#051b32] font-semibold" style={{ width: "100%", textAlign: "center", fontSize: isAndroid ? 30 * scale : 18 * scale }}>
                    
                </Text>
            <BlurView
                intensity={50}
                tint="light"
                className="justify-between bg-white rounded-2xl"
                style={{
                    overflow: "hidden",
                    width: isAndroid ? "90%" : "75%",
                    height: isAndroid ? "75%" : "75%",
                    flexDirection: isAndroid ? "column" : "column",
                    padding: isAndroid ? 16 : 24,
                    gap: 16,
                }}
            >

                {isAndroid ? (
                    // Cascada: scroll vertical, cuadro arriba y texto debajo en cada tarjeta
                    <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
                        {items.map((item, index) => (
                            <View
                                key={index}
                                className="bg-white rounded-2xl p-6"
                                style={{ marginBottom: 16, alignItems: "center" }}
                            >
                                {item.title.map((line, i) => (
                                    <Text
                                        key={i}
                                        className="text-center text-[#051b32] font-bold"
                                        style={{ fontSize: isAndroid ? 50 * scale : 22 * scale }}
                                    >
                                        {line}
                                    </Text>
                                ))}

                                <Text
                                    className="text-[#051b32]"
                                    style={{ textAlign: "justify", fontSize: isAndroid ? 30 * scale : 16 * scale, lineHeight: isAndroid ? 50 * scale : 22 * scale, marginTop: 12 }}
                                >
                                    {item.text}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    // Escritorio/web: filas alternadas, como antes
                    <>
                        {/* Fila 1: cuadro izquierda, texto derecha */}
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}>
                            <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 24 * scale }}>Water bills that are</Text>
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 20 * scale }}>easier to read</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#051b32]" style={{ textAlign: "justify", fontSize: 20 * scale, lineHeight: 24 * scale }}>
                                    We offer an easier and more accessible way to read your water bills without having to try to decipher all the information on a standard water bill.
                                </Text>
                            </View>
                        </View>

                        {/* Fila 2: cuadro derecha, texto izquierda */}
                        <View style={{ flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 16 }}>
                            <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 24 * scale }}>Graphics, statics</Text>
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 20 * scale }}>and dynamic</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#051b32]" style={{ textAlign: "justify", fontSize: 16 * scale, lineHeight: 24 * scale }}>
                                    We have a graph that lets you see your water usage more visually over the course of a week, a month, or a year. It also includes sections for your typical usage, alerts for unusual usage, a history of all your bills, and the option to generate a report as a PDF file.
                                </Text>
                            </View>
                        </View>

                        {/* Fila 3: cuadro izquierda, texto derecha */}
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}>
                            <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 24 * scale }}>Registering Multiple</Text>
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 20 * scale }}>Addresses to Simplify</Text>
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 18 * scale }}>Water Usage Tracking</Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#051b32]" style={{ textAlign: "justify", fontSize: 21 * scale, lineHeight: 24 * scale }}>
                                    You can register multiple addresses in your account to easily track and manage your water usage across different locations.
                                </Text>
                            </View>
                        </View>
                    </>
                )}

            </BlurView>
        </View>
    );
}