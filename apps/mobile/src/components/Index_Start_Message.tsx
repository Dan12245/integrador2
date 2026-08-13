import React from "react";
import { Text, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function Index_Start_Message() {
    const { t } = useTranslation();
    const router = useRouter();
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const isMobile = SCREEN_WIDTH < 768;

    return (
        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", paddingHorizontal: 16 }}>
            <View className="flex flex-col mb-6">
                <Text
                    className="font-semibold text-[#1e90ff] text-center mb-1"
                    style={{ fontSize: isMobile ? 32 : 56 }}
                >
                    {t("landing.improve_world", "Improve the world")}
                </Text>
                <Text
                    className="font-semibold text-[#1e90ff] text-center mb-2"
                    style={{ fontSize: isMobile ? 32 : 56 }}
                >
                    {t("landing.with_awareness", "with awareness.")}
                </Text>
            </View>

            <TouchableOpacity
                className="rounded-xl items-center"
                style={{
                    backgroundColor: "#1e90ff",
                    paddingVertical: isMobile ? 14 : 24,
                    paddingHorizontal: isMobile ? 36 : 48,
                }}
                onPress={() => router.push("/login" as any)}
            >
                <Text
                    className="text-[#051b32] font-semibold"
                    style={{ fontSize: isMobile ? 20 : 28 }}
                >
                    {t("landing.start_now", "Start now")}
                </Text>
            </TouchableOpacity>
        </View>
    );
}