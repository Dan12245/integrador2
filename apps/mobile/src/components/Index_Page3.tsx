import React, { useState } from "react";
import { Text, View, Pressable } from "react-native";
import { BlurView } from "expo-blur";

const faqItems = [
    {
        question: "[01] What is C.R.A?",
        answer: "C.R.A is a platform that helps you conserve water by tracking your usage and giving you actionable insights, one day at a time.",
    },
    {
        question: "[02] Who are us?",
        answer: "We're a small team focused on making water conservation simple and accessible for everyone, from individuals to businesses.",
    },
    {
        question: "[03] Which companies are being supported by us?",
        answer: "We currently support a growing network of partner companies committed to sustainable water usage practices.",
    },
];

export default function Index_Page3() {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center", top: 40}}>

                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="text-6xl font-semibold text-[#051b32] text-center mb-2">                        
                        Frequently Asked Questions
                    </Text>
                    
                </View>
            <BlurView
                intensity={50}
                tint="light"
                className="w-3/4 h-3/4 bg-white rounded-2xl"
                style={{ overflow: "hidden", flexDirection: "row", padding: 24, gap: 16 }}
            >

                {/* Columna de los 3 cuadros, con ancho limitado */}
                <View style={{ width: "50%", flexDirection: "column", gap: 16 }}>

                    {faqItems.map((item, index) => (
                        <View
                            key={index}
                            // @ts-ignore - eventos de mouse, válidos en web via react-native-web
                            onMouseEnter={() => setActiveIndex(index)}
                            style={{ flex: 1 }}
                        >
                            <Pressable onPress={() => setActiveIndex(index)} style={{ flex: 1 }}>
                                <View
                                    className="rounded-2xl p-6 justify-center"
                                    style={{
                                        flex: 1,
                                        backgroundColor: activeIndex === index ? "#051b32" : "white",
                                    }}
                                >
                                    <Text style={{ color: activeIndex === index ? "white" : "#051b32" }}>
                                        {item.question}
                                    </Text>
                                </View>
                            </Pressable>
                        </View>
                    ))}

                </View>

                {/* Texto que cambia según el cuadro activo */}
                <View style={{ width: "50%", justifyContent: "center", paddingHorizontal: 16, minWidth: 0 }}>
                    <Text
                        className="text-lg text-[#051b32]"
                        style={{ flexWrap: "wrap", flexShrink: 1 }}
                    >
                        {faqItems[activeIndex].answer}
                    </Text>
                </View>

            </BlurView>
        </View>
    );
}