import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, useWindowDimensions, Platform, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";


import { useTranslation } from "react-i18next";

export default function Index_Start_Message() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const posthog = usePostHog();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const isMobile = SCREEN_WIDTH < 768;
    const scale = isMobile ? Math.min(Math.max(SCREEN_WIDTH / 440, 0.75), 1) : Math.min(Math.max(SCREEN_WIDTH / 1440, 0.55), 1);

    const items = [
        {
            title: [t("landing.how_1_title", "Water bills that are easier to read")],
            text: t("landing.how_1_text", "We offer an easier and more accessible way to read your water bills without having to try to decipher all the information on a standard water bill."),
        },
        {
            title: [t("landing.how_2_title", "Graphics, statics and dynamic")],
            text: t("landing.how_2_text", "We have a graph that lets you see your water usage more visually over the course of a week, a month, or a year. It also includes sections for your typical usage, alerts for unusual usage, a history of all your bills, and the option to generate a report as a PDF file."),
        },
        {
            title: [t("landing.how_3_title", "Registering Multiple Addresses")],
            text: t("landing.how_3_text", "You can register multiple addresses in your account to easily track and manage your water usage across different locations."),
        },
    ];

    return (
        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", marginTop: isMobile ? 10 : SCREEN_HEIGHT * 0.02 }}>
            <View className="flex flex-col gap-2 mb-4">
                <Text className="font-semibold text-[#051b32] text-center" style={{ fontSize: isMobile ? 32 : 48 * scale }}>
                    {t("landing.how_title", "How does it work?")}
                </Text>
            </View>
            <BlurView
                intensity={50}
                tint="light"
                className="bg-white rounded-2xl"
                style={{
                    overflow: "hidden",
                    width: isMobile ? "92%" : "85%",
                    height: isMobile ? SCREEN_HEIGHT * 0.6 : SCREEN_HEIGHT * 0.65,
                    flexDirection: "column",
                    padding: isMobile ? 12 : 24,
                    gap: 16,
                }}
            >
                {isMobile ? (
                    <ScrollView showsVerticalScrollIndicator={false} style={{ width: "100%" }}>
                        {items.map((item, index) => (
                            <View
                                key={index}
                                className="bg-white rounded-2xl p-4"
                                style={{ marginBottom: 16, alignItems: "center" }}
                            >
                                {item.title.map((line, i) => (
                                    <Text
                                        key={i}
                                        className="text-center text-[#051b32] font-bold"
                                        style={{ fontSize: 18, marginBottom: 4 }}
                                    >
                                        {line}
                                    </Text>
                                ))}

                                <Text
                                    className="text-[#051b32]"
                                    style={{ textAlign: "center", fontSize: 14, lineHeight: 20, marginTop: 8 }}
                                >
                                    {item.text}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    <>
                        {/* Fila 1 */}
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}>
                            <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 20 * scale }}>
                                    {items[0].title[0]}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#051b32]" style={{ textAlign: "justify", fontSize: 20 * scale, lineHeight: 24 * scale }}>
                                    {items[0].text}
                                </Text>
                            </View>
                        </View>

                        {/* Fila 2 */}
                        <View style={{ flex: 1, flexDirection: "row-reverse", alignItems: "center", gap: 16 }}>
                            <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 20 * scale }}>
                                    {items[1].title[0]}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#051b32]" style={{ textAlign: "justify", fontSize: 16 * scale, lineHeight: 24 * scale }}>
                                    {items[1].text}
                                </Text>
                            </View>
                        </View>

                        {/* Fila 3 */}
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 16 }}>
                            <View className="w-1/3 h-full bg-white rounded-2xl p-6 justify-center">
                                <Text className="text-center text-[#051b32] font-bold" style={{ fontSize: 20 * scale }}>
                                    {items[2].title[0]}
                                </Text>
                            </View>
                            <View className="flex-1">
                                <Text className="text-[#051b32]" style={{ textAlign: "justify", fontSize: 21 * scale, lineHeight: 24 * scale }}>
                                    {items[2].text}
                                </Text>
                            </View>
                        </View>
                    </>
                )}
            </BlurView>
        </View>
    );
}