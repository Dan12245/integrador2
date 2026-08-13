import React from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { BlurView } from "expo-blur";
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";

export default function Index_CRA_Blur() {
    const { t } = useTranslation();
    const { width: SCREEN_WIDTH } = useWindowDimensions();
    const isMobile = SCREEN_WIDTH < 768;

    const sphereSize = isMobile ? 95 : 190;

    return (
        <View style={{ width: "100%", alignItems: "center", justifyContent: "center", marginVertical: 20 }}>
            <BlurView
                intensity={50}
                tint="light"
                style={{
                    width: isMobile ? "90%" : "75%",
                    maxWidth: 900,
                    borderRadius: 28,
                    paddingVertical: isMobile ? 32 : 52,
                    paddingHorizontal: isMobile ? 20 : 44,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    overflow: "hidden",
                    backgroundColor: "rgba(255, 255, 255, 0.45)",
                }}
            >
                <View style={{ alignItems: "center", width: "100%", zIndex: 3 }}>
                    <Text
                        style={{
                            fontSize: isMobile ? 48 : 100,
                            fontWeight: "bold",
                            color: "#051b32",
                            textAlign: "center",
                            marginBottom: 8,
                            letterSpacing: isMobile ? 1 : 2,
                        }}
                    >
                        {t("landing.cra_title", "C.R.A")}
                    </Text>

                    <Text
                        style={{
                            fontSize: isMobile ? 20 : 32,
                            fontWeight: "600",
                            color: "#051b32",
                            textAlign: "center",
                            marginBottom: 6,
                        }}
                    >
                        {t("landing.cra_sub1", "Helping you conserve water")}
                    </Text>

                    <Text
                        style={{
                            fontSize: isMobile ? 16 : 24,
                            fontWeight: "600",
                            color: "#051b32",
                            textAlign: "center",
                        }}
                    >
                        {t("landing.cra_sub2", "One day at a time")}
                    </Text>
                </View>

                <Image
                    source={require("../assets/water_sphere.png")}
                    style={{
                        position: "absolute",
                        right: isMobile ? 10 : 24,
                        top: "50%",
                        transform: [{ translateY: -(sphereSize / 2) }],
                        width: sphereSize,
                        height: sphereSize,
                        zIndex: 1,
                        opacity: isMobile ? 0.35 : 0.85,
                    }}
                    contentFit="contain"
                />
            </BlurView>
        </View>
    );
}