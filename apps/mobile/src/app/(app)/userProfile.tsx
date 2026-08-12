import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ImageBackground,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, { FadeInDown, FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import AppNavbar from "../../components/AppNavbar";
import Account from "../../components/Account";
import { supabase } from "../../lib/supabase";

interface ProfileCardProps {
  id: string;
  title: string;
  description: string;
  delay: number;
  isSelected: boolean;
  isMobile: boolean;
  onPress: () => void;
}

// TARJETA INDIVIDUAL (Details / Connected Networks / Settings)
function ProfileCard({
  id,
  title,
  description,
  delay,
  isSelected,
  isMobile,
  onPress,
}: ProfileCardProps) {
  const { t } = useTranslation();
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={{
        flex: isMobile ? 0 : 1,
        width: isMobile ? "100%" : "auto",
      }}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={{
          width: "100%",
          backgroundColor: "white",
          borderRadius: 24,
          padding: isMobile ? 18 : 24,
          justifyContent: "space-between",
          borderWidth: isSelected ? 2.5 : 1,
          borderColor: isSelected ? "#2089dc" : "#ffffff",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isSelected ? 0.14 : 0.06,
          shadowRadius: isSelected ? 12 : 8,
          elevation: isSelected ? 6 : 3,
        }}
      >
        <View>
          <Text className="text-xl sm:text-2xl font-black text-[#0d1b2e] text-center mb-3">
            {title}
          </Text>

          <View
            className={`h-[1.5px] mb-4 mx-2 ${
              isSelected ? "bg-[#2089dc]" : "bg-[#0d1b2e]"
            }`}
          />

          <Text className="text-xs sm:text-sm text-[#0d1b2e]/75 text-center leading-5 sm:leading-6">
            {description}
          </Text>
        </View>

        {id === "Details" && (
          <Text
            className={`text-xs text-center font-bold mt-4 ${
              isSelected ? "text-[#2089dc]" : "text-gray-400"
            }`}
          >
            {isSelected ? t("profile.hideProfile") : t("profile.viewProfile")}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// PANTALLA PRINCIPAL USER PROFILE
export default function UserProfile() {
  const { t } = useTranslation();
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 768;

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState<string | null>("Details");

  useEffect(() => {
    supabase.auth
      .getSession()
      .then((res) => {
        const session = res.data.session;
        if (session?.user) {
          setUserId(session.user.id);
          setEmail(session.user.email);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cards = [
    {
      id: "Details",
      title: "Details",
      shortTitle: "Details",
      icon: "user" as const,
      description:
        "Manage your personal information, update avatar, view account details, and edit profile settings.",
    },
    {
      id: "Connected Networks",
      title: "Connected Networks",
      shortTitle: "Networks",
      icon: "wifi" as const,
      description:
        "Overview of connected smart meters, IoT devices, building management systems, and network status.",
    },
    {
      id: "Settings",
      title: "Settings",
      shortTitle: "Settings",
      icon: "settings" as const,
      description:
        "Preferences, language configuration, privacy settings, and security protocols for your account.",
    },
  ];

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#0d1b2e] items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  const activeUserId = userId || "demo-user-id";
  const activeEmail = email || "user@example.com";

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <View className="flex-1">
        <ImageBackground
          source={require("../../assets/images/water_bg1.png")}
          resizeMode="cover"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            paddingVertical: isMobile ? 16 : 36,
            paddingHorizontal: isMobile ? 12 : 24,
          }}
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
        >
          {isMobile ? (
            /* TAB SELECTOR STRIP FOR MOBILE */
            <Animated.View
              entering={FadeInUp.duration(400).springify()}
              style={{
                width: "100%",
                maxWidth: 600,
                backgroundColor: "rgba(255,255,255,0.85)",
                borderRadius: 20,
                padding: 6,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              {cards.map((card) => {
                const isSelected = activeCard === card.id;
                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => setActiveCard(card.id)}
                    activeOpacity={0.8}
                    style={{
                      flex: 1,
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      borderRadius: 14,
                      backgroundColor: isSelected ? "#2089dc" : "transparent",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <Feather
                      name={card.icon}
                      size={15}
                      color={isSelected ? "#ffffff" : "#0d1b2e"}
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontSize: 12,
                        fontWeight: "700",
                        color: isSelected ? "#ffffff" : "#0d1b2e",
                      }}
                    >
                      {card.shortTitle}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          ) : (
            /* FILA DE TARJETAS PARA DESKTOP */
            <Animated.View
              entering={FadeInUp.duration(500).springify()}
              style={{
                width: "100%",
                maxWidth: 1050,
                borderRadius: 32,
                padding: 20,
                backgroundColor: "rgba(255,255,255,0.60)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.08,
                shadowRadius: 16,
                elevation: 4,
                marginBottom: activeCard ? 32 : 0,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "stretch",
                  justifyContent: "space-between",
                  gap: 16,
                  width: "100%",
                }}
              >
                {cards.map((card, i) => (
                  <ProfileCard
                    key={card.id}
                    id={card.id}
                    title={card.title}
                    description={card.description}
                    delay={i * 120}
                    isSelected={activeCard === card.id}
                    isMobile={false}
                    onPress={() => {
                      setActiveCard((prev) => (prev === card.id ? null : card.id));
                    }}
                  />
                ))}
              </View>
            </Animated.View>
          )}

          {/* CONTENIDO PRINCIPAL SEGUN LA TARJETA SELECCIONADA */}
          {activeCard === "Details" && (
            <Animated.View
              entering={FadeInUp.duration(450).springify()}
              exiting={FadeOutUp.duration(300)}
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: isMobile ? 20 : 32,
                padding: isMobile ? 16 : 28,
                backgroundColor: "rgba(255,255,255,0.95)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 6,
                marginBottom: 32,
              }}
            >
              <Text className="text-xl sm:text-3xl font-black text-[#0d1b2e] text-center mb-1">
                User Profile
              </Text>
              <Text className="text-xs sm:text-sm text-gray-500 text-center mb-3">
                Manage your personal information, update avatar, and edit account settings.
              </Text>
              <View className="h-[2.5px] bg-[#2089dc] mb-2 mx-auto w-16" />

              <Account key={activeUserId} userId={activeUserId} email={activeEmail} />
            </Animated.View>
          )}

          {activeCard === "Connected Networks" && (
            <Animated.View
              entering={FadeInUp.duration(450).springify()}
              exiting={FadeOutUp.duration(300)}
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: isMobile ? 20 : 32,
                padding: isMobile ? 16 : 28,
                backgroundColor: "rgba(255,255,255,0.95)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 6,
                marginBottom: 32,
              }}
            >
              <Text className="text-xl sm:text-2xl font-bold text-[#0d1b2e] text-center mb-2">
                Connected Networks
              </Text>
              <View className="h-[2px] bg-[#2089dc] mb-4 mx-auto w-16" />
              <Text className="text-xs sm:text-sm text-gray-600 text-center leading-5 sm:leading-6 mb-6">
                Overview of connected smart meters, IoT devices, building management systems, and network status.
              </Text>

              <View className="bg-[#f0f4f8] rounded-2xl p-4 sm:p-6 border border-gray-200">
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm sm:text-base font-bold text-[#0d1b2e]">Telemetry Protocol</Text>
                  <View className="bg-green-100 px-3 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-green-700">MQTT / HTTP Online</Text>
                  </View>
                </View>
                <Text className="text-xs sm:text-sm text-gray-600">
                  Active telemetry devices: 3 smart meters currently transmitting data.
                </Text>
              </View>
            </Animated.View>
          )}

          {activeCard === "Settings" && (
            <Animated.View
              entering={FadeInUp.duration(450).springify()}
              exiting={FadeOutUp.duration(300)}
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: isMobile ? 20 : 32,
                padding: isMobile ? 16 : 28,
                backgroundColor: "rgba(255,255,255,0.95)",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.1,
                shadowRadius: 20,
                elevation: 6,
                marginBottom: 32,
              }}
            >
              <Text className="text-xl sm:text-2xl font-bold text-[#0d1b2e] text-center mb-2">
                Settings
              </Text>
              <View className="h-[2px] bg-[#2089dc] mb-4 mx-auto w-16" />
              <Text className="text-xs sm:text-sm text-gray-600 text-center leading-5 sm:leading-6 mb-6">
                Preferences, language configuration, privacy settings, and security protocols for your account.
              </Text>

              <View className="bg-[#f0f4f8] rounded-2xl p-4 sm:p-6 border border-gray-200 gap-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-[#0d1b2e]">Language</Text>
                  <Text className="text-xs font-bold text-[#2089dc]">English (EN)</Text>
                </View>
                <View className="h-px bg-gray-200" />
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-[#0d1b2e]">Notifications</Text>
                  <Text className="text-xs font-bold text-green-600">Enabled</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}




