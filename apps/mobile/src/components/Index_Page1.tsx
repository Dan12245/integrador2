import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, Pressable, useWindowDimensions, Platform, ScrollView, Modal } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";
import { Image } from "expo-image";

import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

import { GestureHandlerRootView } from "react-native-gesture-handler";


import { useTranslation } from "react-i18next";

const featureImages = [
    require("../assets/Graphic Example.png"),
    require("../assets/Map Example.png"),
    require("../assets/Bill-example.png"),
];

function ZoomableImage({ source }: { source: any }) {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);

    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const savedTranslateX = useSharedValue(0);
    const savedTranslateY = useSharedValue(0);

    const focalX = useSharedValue(0);
    const focalY = useSharedValue(0);

    const pinchGesture = Gesture.Pinch()
        .onStart((event) => {
            focalX.value = event.focalX;
            focalY.value = event.focalY;
        })
        .onUpdate((event) => {
            scale.value = savedScale.value * event.scale;
        })
        .onEnd(() => {
            if (scale.value < 1) {
                scale.value = withSpring(1);
                savedScale.value = 1;
                translateX.value = withSpring(0);
                translateY.value = withSpring(0);
                savedTranslateX.value = 0;
                savedTranslateY.value = 0;
            } else if (scale.value > 5) {
                scale.value = withSpring(5);
                savedScale.value = 5;
            } else {
                savedScale.value = scale.value;
            }
        });

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (savedScale.value > 1) {
                translateX.value = savedTranslateX.value + event.translationX;
                translateY.value = savedTranslateY.value + event.translationY;
            }
        })
        .onEnd(() => {
            savedTranslateX.value = translateX.value;
            savedTranslateY.value = translateY.value;
        });

    const doubleTapGesture = Gesture.Tap()
        .numberOfTaps(2)
        .onEnd(() => {
            scale.value = withSpring(1);
            savedScale.value = 1;
            translateX.value = withSpring(0);
            translateY.value = withSpring(0);
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
        });

    const composedGesture = Gesture.Simultaneous(
        Gesture.Race(doubleTapGesture, panGesture),
        pinchGesture
    );

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
        ],
    }));

    return (
        <GestureDetector gesture={composedGesture}>
            <Animated.View style={[{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }, animatedStyle]}>
                <Image source={source} resizeMode="contain" style={{ width: "100%", height: "100%" }} />
            </Animated.View>
        </GestureDetector>
    );
}

export default function Index_Start_Message() {
    const { t } = useTranslation();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const router = useRouter();
    const posthog = usePostHog();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const isMobile = SCREEN_WIDTH < 768;
    const scale = isMobile ? Math.min(Math.max(SCREEN_WIDTH / 440, 0.75), 1) : Math.min(Math.max(SCREEN_WIDTH / 1440, 0.55), 1);

    const features = [
        {
            text: t("landing.feature_1", "A more dynamic and visual way to read your water bill with a graphic and stats."),
            image: featureImages[0],
        },
        {
            text: t("landing.feature_2", "A system for saving and recording multiple addresses using a map."),
            image: featureImages[1],
        },
        {
            text: t("landing.feature_3", "A scanner to collect data directly from your water bills to make everything faster and more secure."),
            image: featureImages[2],
        },
    ];

    return (
        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", marginTop: isMobile ? 10 : SCREEN_HEIGHT * 0.02 }}>
            <View className="flex flex-col gap-2 mb-4">
                <Text className="font-semibold text-[#051b32] text-center" style={{ fontSize: isMobile ? 32 : 48 * scale }}>
                    {t("landing.features_title", "Features")}
                </Text>
                <Text className="text-[#051b32] font-semibold" style={{ width: "100%", textAlign: "center", fontSize: isMobile ? 14 : 16 * scale }}>
                    {isMobile ? t("landing.features_sub_mobile", "Tap an image to inspect details.") : t("landing.features_sub_desktop", "Click on the images to view them.")}
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
                        {features.map((feature, index) => (
                            <View key={index} className="bg-white rounded-2xl p-4" style={{ marginBottom: 16 }}>
                                <Text className="font-semibold text-center" style={{ fontSize: 15, color: "#051b32", marginBottom: 10 }}>
                                    {feature.text}
                                </Text>
                                <Pressable onPress={() => setSelectedIndex(index)} style={{ zIndex: 10 }}>
                                    <Image
                                        source={feature.image}
                                        resizeMode="contain"
                                        style={{ width: "100%", height: 160 }}
                                    />
                                </Pressable>
                            </View>
                        ))}
                    </ScrollView>
                ) : (
                    features.map((feature, index) => (
                        <View key={index} className="flex-1 flex-col gap-4 bg-white rounded-2xl p-6">
                            <Text className="font-semibold text-center" style={{ fontSize: 16 * scale, color: "#051b32" }}>
                                {feature.text}
                            </Text>
                            <Pressable onPress={() => setSelectedIndex(index)}>
                                <Image
                                    source={feature.image}
                                    resizeMode="contain"
                                    style={{ width: "100%", height: SCREEN_HEIGHT * 0.28 }}
                                />
                            </Pressable>
                        </View>
                    ))
                )}
            </BlurView>

            {/* 👇 AQUÍ VA EL MODAL, reemplazando el overlay anterior */}
            <Modal
                visible={selectedIndex !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedIndex(null)}
            >
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.85)",
                        }}
                    >
                        {selectedIndex !== null && (
                            Platform.OS !== "web" ? (
                                <>
                                    <ZoomableImage source={features[selectedIndex].image} />

                                    <Pressable
                                        onPress={() => setSelectedIndex(null)}
                                        style={{
                                            position: "absolute",
                                            top: 40,
                                            right: 20,
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: "rgba(255,255,255,0.2)",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            zIndex: 200,
                                        }}
                                    >
                                        <Text style={{ color: "white", fontSize: 22, fontWeight: "600" }}>✕</Text>
                                    </Pressable>
                                </>
                            ) : (
                                <Pressable
                                    onPress={() => setSelectedIndex(null)}
                                    style={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}
                                >
                                    <Image
                                        source={features[selectedIndex].image}
                                        resizeMode="contain"
                                        style={{ width: "80%", height: "80%" }}
                                    />
                                </Pressable>
                            )
                        )}
                    </View>
                </GestureHandlerRootView>
            </Modal>
        </View>
    );
}