import React from "react";
import { View, Text, ScrollView, Dimensions, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Cada tarjeta ocupa 30% del ancho de pantalla para que queden centradas de forma simétrica (con un mínimo de 260px)
const CARD_WIDTH = SCREEN_WIDTH * 0.30;

interface ProfileCardProps {
  title: string;
  description: string;
  delay: number;
}

// TARJETA INDIVIDUAL (Details / Connected Networks / Settings)
function ProfileCard({ title, description, delay }: ProfileCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(500).springify()}
      style={{
        width: CARD_WIDTH,
        minWidth: 260,
        backgroundColor: "white",
        borderRadius: 36,
        padding: 32,
        marginHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      <Text
        className="text-3xl font-black text-[#0d1b2e] text-center mb-4"
        style={{ fontFamily: "Inter_900Black" }}
      >
        {title}
      </Text>

      <View className="h-[1.5px] bg-[#0d1b2e] mb-6 mx-2" />

      <Text
        className="text-base text-[#0d1b2e]/75 text-center leading-6"
        style={{ fontFamily: "Inter_400Regular" }}
      >
        {description}
      </Text>
    </Animated.View>
  );
}

// PANTALLA PRINCIPAL (o sea lo que se ve más al frente)
export default function UserProfile() {
  const cards = [
    {
      title: "Details",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor maecenas fermentum volutpat scelerisque blandit enim ornare aliquam facilisi nisl magna, montes ac suspendisse vivamus purus metus consequat lalala no nos importa perdedor",
    },
    {
      title: "Connected\nNetworks",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor maecenas fermentum volutpat scelerisque blandit enim ornare aliquam facilisi nisl magna, montes ac suspendisse",
    },
    {
      title: "Settings",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor maecenas fermentum volutpat scelerisque blandit enim ornare aliquam facilisi nisl magna, montes ac suspendisse vivamus purus metus consequat lalala no nos importa perdedor",
    },
  ];

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <View className="flex-1">
        {/* RECORDATORIO DE COMO SE CAMBIA LA IMAGEN DE FONDO:
            · Cambia la ruta en require() por la de tu imagen
            · La imagen debe estar en apps/mobile/assets/images/ */}
        <ImageBackground
          source={require("../../assets/images/water_bg1.png")}
          resizeMode="cover"
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        />

        {/* SCROLL PRINCIPAL */}
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingVertical: 48,
            paddingHorizontal: 32,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* RECUADRO EXTERIOR GRANDE
              · Es el contenedor padre que envuelve las 3 tarjetas */}
          <Animated.View
            entering={FadeInUp.duration(500).springify()}
            style={{
              width: "100%",
              borderRadius: 40,
              padding: 24,
              backgroundColor: "rgba(255,255,255,0.50)",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.10,
              shadowRadius: 20,
              elevation: 5,
            }}
          >
            {/* FILA DE 3 TARJETAS dentro del recuadro exterior
                · flex-row -> las tarjetas van en horizontal */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                alignItems: "stretch",
                justifyContent: "center",
                paddingVertical: 8,
                paddingHorizontal: 4,
              }}
            >
              {cards.map((card, i) => (
                <ProfileCard
                  key={i}
                  title={card.title}
                  description={card.description}
                  delay={i * 120}
                />
              ))}
            </ScrollView>
          </Animated.View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
}