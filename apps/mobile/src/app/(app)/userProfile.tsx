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
            {isSelected ? "▲ Hide User Profile" : "▶ Click to View Profile"}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// PANTALLA PRINCIPAL USER PROFILE
export default function UserProfile() {
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
      description:
        "Manage your personal information, update avatar, view account details, and edit profile settings.",
    },
    {
      id: "Connected Networks",
      title: "Connected Networks",
      description:
        "Overview of connected smart meters, IoT devices, building management systems, and network status.",
    },
    {
      id: "Settings",
      title: "Settings",
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
            paddingHorizontal: isMobile ? 12 : 16,
          }}
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
        >
          {/* FILA DE TARJETAS DE INFORMACION (Details / Networks / Settings) */}
          <Animated.View
            entering={FadeInUp.duration(500).springify()}
            style={{
              width: "100%",
              maxWidth: 1050,
              borderRadius: isMobile ? 24 : 32,
              padding: isMobile ? 12 : 20,
              backgroundColor: "rgba(255,255,255,0.60)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
              marginBottom: activeCard ? (isMobile ? 20 : 32) : 0,
            }}
          >
            <View
              style={{
                flexDirection: isMobile ? "column" : "row",
                alignItems: "stretch",
                justifyContent: "space-between",
                gap: isMobile ? 12 : 16,
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
                  isMobile={isMobile}
                  onPress={() => {
                    setActiveCard((prev) => (prev === card.id ? null : card.id));
                  }}
                />
              ))}
            </View>
          </Animated.View>

          {/* RECUADRO EXTERIOR PRINCIPAL: Account Profile (Displayed when Details card is active) */}
          {activeCard === "Details" && (
            <Animated.View
              entering={FadeInUp.duration(450).springify()}
              exiting={FadeOutUp.duration(300)}
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: isMobile ? 24 : 32,
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
              <Text className="text-2xl sm:text-3xl font-black text-[#0d1b2e] text-center mb-2">
                User Profile
              </Text>
              <View className="h-[2.5px] bg-[#0d1b2e] mb-4 mx-auto w-20" />

              <Account key={activeUserId} userId={activeUserId} email={activeEmail} />
            </Animated.View>
          )}

          {/* SECCION ADICIONAL SI SE HACE CLICK EN OTRAS TARJETAS */}
          {activeCard === "Connected Networks" && (
            <Animated.View
              entering={FadeInUp.duration(450).springify()}
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: isMobile ? 24 : 32,
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
              <Text className="text-xl sm:text-2xl font-bold text-[#0d1b2e] text-center mb-3">
                Connected Networks
              </Text>
              <View className="h-[2px] bg-[#0d1b2e] mb-4 mx-auto w-16" />
              <Text className="text-xs sm:text-sm text-gray-600 text-center leading-5 sm:leading-6">
                Active telemetry devices: 3 smart meters online. Network protocol: MQTT/HTTP. All systems operational.
              </Text>
            </Animated.View>
          )}

          {activeCard === "Settings" && (
            <Animated.View
              entering={FadeInUp.duration(450).springify()}
              style={{
                width: "100%",
                maxWidth: 900,
                borderRadius: isMobile ? 24 : 32,
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
              <Text className="text-xl sm:text-2xl font-bold text-[#0d1b2e] text-center mb-3">
                Settings
              </Text>
              <View className="h-[2px] bg-[#0d1b2e] mb-4 mx-auto w-16" />
              <Text className="text-xs sm:text-sm text-gray-600 text-center leading-5 sm:leading-6">
                System preferences: Language (EN/ES), dark mode toggles, and notification preferences.
              </Text>
            </Animated.View>
          )}
        </KeyboardAwareScrollView>
      </View>
    </SafeAreaView>
  );
}



