import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, LayoutAnimation, Platform, UIManager } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const faqItems = [
    {
        question: "[01] What is C.R.A?",
        answer: "We currently support a growing network of partner companies committed to sustainable water usage practices.",
    },
    {
        question: "[02] Who are us?",
        answer: "We currently support a growing network of partner companies committed to sustainable water usage practices.",
    },
    {
        question: "[03] Which companies are being supported by us?",
        answer: "We currently support a growing network of partner companies committed to sustainable water usage practices.",
    },
];

export default function Index_Start_Message() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const router = useRouter();
    const posthog = usePostHog();

    const toggleItem = (index: number) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center", top: 40}}>
            <BlurView
                intensity={50}
                tint="light"
                className="w-3/4 flex-row justify-between p-6 bg-white rounded-2xl gap-4"
                style={{ overflow: "hidden", minHeight: 300 }}
            >
                {/* Texto lateral — se queda igual, lado a lado con las preguntas */}
                <View className="w-1/2 justify-center">
                    <Text className="text-2xl font-semibold text-[#051b32] text-center">
                        Frequently 
                    </Text>
                    <Text className="text-2xl font-semibold text-[#051b32] text-center ">
                        Asked
                    </Text>
                    <Text className="text-2xl font-semibold text-[#051b32] text-center ">
                        Questions
                    </Text>
                </View>

                {/* Columna de preguntas plegables — al lado del texto */}
                <View className="w-1/2 flex-col gap-4">

                    {faqItems.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <TouchableOpacity
                                key={index}
                                activeOpacity={0.8}
                                onPress={() => toggleItem(index)}
                                className="bg-white rounded-2xl p-6"
                                style={{ width: 750, alignSelf: "flex-end" }}
                            >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={{ color: "#051b32", fontWeight: "600", flex: 1 }}>
                                        {item.question}
                                    </Text>
                                    <Text style={{ color: "#051b32", fontSize: 18, marginLeft: 8 }}>
                                        {isOpen ? "−" : "+"}
                                    </Text>
                                </View>

                                {isOpen && (
                                    <Text style={{ color: "#051b32", marginTop: 12, opacity: 0.8 }}>
                                        {item.answer}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}

                </View>

            </BlurView>
        </View>
    );
}