import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Platform,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInLeft,
} from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";
import FeedbackForm from "../../components/FeedbackForm";
import AIChatBubble from "../../components/AIChatBubble";

interface HelpCardProps {
  title: string;
  description: string;
  delay: number;
}

// TARJETA FAQ / CONTACT US
function HelpCard({ title, description, delay }: HelpCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      className="flex-1 bg-white rounded-3xl p-6"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Text className="text-xl font-black text-[#0d1b2e] text-center mb-3">
        {title}
      </Text>
      <View className="h-[1.5px] bg-[#0d1b2e] mb-4" />
      <Text className="text-sm text-[#0d1b2e]/60 text-center leading-5">
        {description}
      </Text>
    </Animated.View>
  );
}

// ─── PANTALLA PRINCIPAL: Tech Support ────────────────────────────────────────
export default function TechSupport() {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCards = [
    {
      title: "FAQ",
      description: "Find answers to commonly asked questions regarding water meter telemetry and billing.",
    },
    {
      title: "Contact Us",
      description: "Direct support contact options for urgent technical inquiries and meter issues.",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <KeyboardAwareScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
      >
          {/* HERO OSCURO */}
          <View className="bg-[#0d1b2e] px-8 pt-10 pb-16">
            <Animated.Text
              entering={FadeInLeft.duration(500).springify()}
              style={{ fontSize: 44, color: "#ffffff" }}
              className="font-black leading-tight mb-8"
            >
              {"How can we\nhelp?"}
            </Animated.Text>

            {/* BARRA DE BÚSQUEDA */}
            <Animated.View
              entering={FadeInDown.delay(150).duration(450).springify()}
              className="flex-row items-center bg-white rounded-full px-6 py-4 gap-3"
              style={{
                maxWidth: 680,
                borderWidth: 2,
                borderColor: "#7ab8d9",
              }}
            >
              <Text className="text-gray-400 text-xl">🔍</Text>
              <TextInput
                className="flex-1 text-base text-gray-700"
                placeholder="Search your issue here"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </Animated.View>
          </View>

          {/* SECCION DE TARJETAS FAQ / CONTACT US & FEEDBACK FORM */}
          <Animated.View
            entering={FadeInLeft.delay(200).duration(450).springify()}
            className="bg-[#daedf7] p-6 gap-6"
          >
            <View
              className="rounded-3xl p-4"
              style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
            >
              <View className="flex-row gap-4 flex-wrap sm:flex-nowrap">
                {helpCards.map((card, i) => (
                  <HelpCard
                    key={i}
                    title={card.title}
                    description={card.description}
                    delay={i * 100}
                  />
                ))}
              </View>
            </View>

            {/* FORMULARIO DE FEEDBACK */}
            <FeedbackForm />
          </Animated.View>
      </KeyboardAwareScrollView>

      {/* Volatile AI Assistant Floating Chat Widget */}
      <AIChatBubble />
    </SafeAreaView>
  );
}

