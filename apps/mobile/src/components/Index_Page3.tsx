import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, Pressable, Platform, useWindowDimensions, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";


import { useTranslation } from "react-i18next";

const faqImages = [
    require("../assets/logo.png"),
    require("../assets/CRA-building.png"),
    require("../assets/jmas-logo.png"),
];

export default function Index_Start_Message() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const posthog = usePostHog();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const isMobile = SCREEN_WIDTH < 768;
    const scale = isMobile ? Math.min(Math.max(SCREEN_WIDTH / 440, 0.75), 1) : Math.min(Math.max(SCREEN_WIDTH / 1440, 0.55), 1);
    const imageSize = isMobile ? 100 : Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.22;

    const faqItems = [
        {
            question: t("landing.faq_1_q", "What is C.R.A?"),
            answer: t("landing.faq_1_a", "C.R.A. is a platform that helps you save water by tracking your usage and provides useful information, such as tips and alerts about irregular usage."),
            image: faqImages[0],
        },
        {
            question: t("landing.faq_2_q", "Who are us?"),
            answer: t("landing.faq_2_a", "We're a company focused on making water conservation simple and accessible for everyone, from individuals to businesses through a mobile app"),
            image: faqImages[1],
        },
        {
            question: t("landing.faq_3_q", "Who are our partners?"),
            answer: t("landing.faq_3_a", "Our current partners include companies such as JMAS, which help us offer benefits such as discounts on water bills by maintaining a consistent consumption record."),
            image: faqImages[2],
        },
    ];

    return (
        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", marginTop: isMobile ? 10 : SCREEN_HEIGHT * 0.02 }}>
            <View className="flex flex-col gap-2 mb-4">
                <Text className="font-semibold text-[#051b32] text-center" style={{ fontSize: isMobile ? 26 : 48 * scale }}>
                    {t("landing.faq_title", "Frequently Asked Questions")}
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
                    flexDirection: isMobile ? "column" : "row",
                    padding: isMobile ? 12 : 24,
                    gap: 16,
                }}
            >
                {isMobile ? (
                    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} style={{ width: "100%" }}>
                        {faqItems.map((item, index) => {
                            const isActive = activeIndex === index;

                            return (
                                <Pressable key={index} onPress={() => setActiveIndex(index)}>
                                    <View
                                        className="rounded-2xl p-4"
                                        style={{
                                            marginBottom: 12,
                                            backgroundColor: isActive ? "#051b32" : "white",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text
                                            className="font-bold text-center"
                                            style={{ fontSize: 16, color: isActive ? "white" : "#051b32" }}
                                        >
                                            {item.question}
                                        </Text>

                                        {isActive && (
                                            <>
                                                <Text
                                                    className="font-semibold text-center"
                                                    style={{ fontSize: 13, color: "white", marginTop: 8 }}
                                                >
                                                    {item.answer}
                                                </Text>
                                                <Image
                                                    source={item.image}
                                                    style={{ width: imageSize, height: imageSize, marginTop: 8 }}
                                                    resizeMode="contain"
                                                />
                                            </>
                                        )}
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                ) : (
                    <>
                        <View style={{ width: "50%", flexDirection: "column", gap: 16 }}>
                            {faqItems.map((item, index) => (
                                <Pressable
                                    key={index}
                                    onPress={() => setActiveIndex(index)}
                                    style={{ flex: 1 }}
                                >
                                    <View
                                        className="rounded-2xl p-6 justify-center"
                                        style={{
                                            flex: 1,
                                            backgroundColor: activeIndex === index ? "#051b32" : "white",
                                        }}
                                    >
                                        <Text className="font-bold text-center" style={{ fontSize: 20 * scale, color: activeIndex === index ? "white" : "#051b32" }}>
                                            {item.question}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </View>

                        <View style={{ width: "50%", justifyContent: "center", alignItems: "center", paddingHorizontal: 16, minWidth: 0 }}>
                            <Text
                                className="font-bold text-[#051b32]"
                                style={{ flexWrap: "wrap", flexShrink: 1, textAlign: "center", fontSize: 18 * scale }}
                            >
                                {faqItems[activeIndex].answer}
                            </Text>

                            <Image
                                source={faqItems[activeIndex].image}
                                style={{ width: imageSize, height: imageSize }}
                                resizeMode="contain"
                            />
                        </View>
                    </>
                )}
            </BlurView>
        </View>
    );
}