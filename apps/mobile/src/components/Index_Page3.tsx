import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, Pressable, Platform, useWindowDimensions, ScrollView } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";


const faqItems = [
    {
        question: "What is C.R.A?",
        answer: "C.R.A. is a platform that helps you save water by tracking your usage and provides useful information, such as tips and alerts about irregular usage.",
        image: require("../assets/logo.png"),
    },
    {
        question: "Who are us?",
        answer: "We're a company focused on making water conservation simple and accessible for everyone, from individuals to businesses through a mobile app",
        image: require("../assets/CRA-building.png"),
    },
    {
        question: "Who are our partners?",
        answer: "Our current partners include companies such as JMAS, which help us offer benefits such as discounts on water bills by maintaining a consistent consumption record.",
        image: require("../assets/jmas-logo.png"),
    },
];

export default function Index_Start_Message() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const router = useRouter();
    const posthog = usePostHog();
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
    const scale = Math.min(Math.max(SCREEN_WIDTH / 1440, 0.55), 1);
    const imageSize = Math.min(SCREEN_WIDTH, SCREEN_HEIGHT) * 0.22;
    const isAndroid = Platform.OS !== "web";

    return (
        <View style={{flex: 1, right: isAndroid ? 50 : 0 , position: "relative", alignItems: "center", justifyContent: "center", top: isAndroid ? -75 : SCREEN_HEIGHT * 0.02}}>


                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="font-semibold text-[#051b32] text-center mb-2" style={{ fontSize: isAndroid ? 90 * scale : 60 * scale}}>                        
                        Frequently Asked Questions
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
                className="bg-white rounded-2xl"
                style={{
                    overflow: "hidden",
                    width: isAndroid ? "90%" : "75%",
                    height: isAndroid ? "70%" : "75%",
                    flexDirection: isAndroid ? "column" : "row",
                    padding: isAndroid ? 16 : 24,
                    gap: 16,
                }}
            >

                {isAndroid ? (
                    // Cascada: cada tarjeta es pregunta + respuesta + imagen, apiladas
                    <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled={true} style={{ width: "100%" }}>
                        {faqItems.map((item, index) => {
                            const isActive = activeIndex === index;

                            return (
                                <Pressable key={index} onPress={() => setActiveIndex(index)}>
                                    <View
                                        className="rounded-2xl p-6"
                                        style={{
                                            marginBottom: 16,
                                            backgroundColor: isActive ? "#051b32" : "white",
                                            alignItems: "center",
                                        }}
                                    >
                                        <Text
                                            className="font-bold text-center"
                                            style={{ fontSize: isAndroid ? 60 * scale : 20 * scale, color: isActive ? "white" : "#051b32" }}
                                        >
                                            {item.question}
                                        </Text>

                                        {isActive && (
                                            <>
                                                <Text
                                                    className="font-semibold text-center"
                                                    style={{ fontSize: isAndroid ? 40 * scale : 16 * scale, color: "white", marginTop: 12 }}
                                                >
                                                    {item.answer}
                                                </Text>
                                                <Image
                                                    source={item.image}
                                                    style={{ width: imageSize, height: imageSize, marginTop: 12 }}
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
                    // Escritorio/web: dos columnas, como antes
                    <>
                        {/* Columna de los 3 cuadros, con ancho limitado */}
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

                        {/* Texto que cambia según el cuadro activo */}
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