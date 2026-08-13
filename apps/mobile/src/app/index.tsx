import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ImageBackground, ScrollView, Animated, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { usePostHog } from "../lib/posthog";
import { useTranslation } from "react-i18next";

import { Image } from "expo-image";

import { Modal } from "react-native";

import { Platform } from "react-native";
import { Feather } from "@expo/vector-icons";

import Index_CRA_Blur from "../components/Index_CRA_Blur";
import Index_Start_Message from "../components/Index_Start_Message";
import Index_Page1 from "../components/Index_Page1";
import Index_Page2 from "../components/Index_Page2";
import Index_Page3 from "../components/Index_Page3";

import { useSafeAreaInsets } from "react-native-safe-area-context";


const carouselSlides = [Index_Page1, Index_Page2, Index_Page3];

export default function LandingScreen() {
    const { t, i18n } = useTranslation();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();
    const posthog = usePostHog();
    const insets = useSafeAreaInsets();

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    const currentLang = i18n.language || "es";

    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

    const isCompactScreen = SCREEN_WIDTH < 768;
    const isAndroid = Platform.OS !== "web";

    // Constantes adaptadas al tamaño de pantalla móvil y desktop
    const BAR_HEIGHT_FULL = isCompactScreen ? 56 : SCREEN_HEIGHT * 0.08;
    const BAR_HEIGHT_COMPACT = isCompactScreen ? 52 : SCREEN_HEIGHT * 0.075;
    const BAR_WIDTH_COMPACT = isCompactScreen ? SCREEN_WIDTH * 0.94 : SCREEN_WIDTH * 0.55;
    const SCROLL_RANGE = SCREEN_HEIGHT * 0.1;
    const SECTION_HEIGHT = SCREEN_HEIGHT * 0.9;
    const SECTION_OVERLAP = SCREEN_HEIGHT * 0.08;

    
    const sectionPositions = useRef<{ [key: string]: number }>({});



    const scrollToSection = (key: string, offsetMultiplier: number = 0.1) => {
        const y = sectionPositions.current[key];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y - SCREEN_HEIGHT * offsetMultiplier, animated: true });
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
            if (session) {
                router.replace("/home" as any);
            }
        });
    }, []);

    const goToSlide = (newIndex: number) => {
        if (newIndex < 0 || newIndex >= carouselSlides.length) return;

        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
        }).start(() => {
            setSlideIndex(newIndex);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        });
    };

    if (loading || session) {

        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    const CurrentSlide = carouselSlides[slideIndex];

    const barWidth = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [SCREEN_WIDTH, BAR_WIDTH_COMPACT],
        extrapolate: "clamp",
    });

    const barHeight = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [BAR_HEIGHT_FULL, BAR_HEIGHT_COMPACT],
        extrapolate: "clamp",
    });



    const barRadius = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [0, 30],
        extrapolate: "clamp",
    });

    const sideElementsOpacity = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE * 0.6],
        outputRange: [1, isCompactScreen ? 0.95 : 0],
        extrapolate: "clamp",
    });

    const qnaBackgroundSource = isAndroid
        ? require("../assets/bg_movile.png")
        : require("../assets/index_bg_2.gif");

    const barTranslateY = scrollY.interpolate({
        inputRange: [0, SCROLL_RANGE],
        outputRange: [0, isAndroid ? -150 : 0],   // 👈 solo se oculta en móvil
        extrapolate: "clamp",
    });

    return (
        
        <View className="flex-1 bg-[#051b32]">
        
            <Animated.View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    alignItems: "center",
                    paddingTop: insets.top,
                    transform: [{ translateY: barTranslateY }],
                }}
            >
                <Animated.View
                    style={{
                        width: barWidth,
                        height: barHeight,
                        borderRadius: barRadius,
                        backgroundColor: "#051b32",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        paddingHorizontal: isCompactScreen ? 16 : SCREEN_WIDTH * 0.02,
                        overflow: "hidden",
                    }}
                >
                    <Animated.View style={{ opacity: sideElementsOpacity }}>
                        <TouchableOpacity onPress={() => scrollToSection("howItWorks")} className="flex-row items-center">
                            <Image
                                source={require("../assets/logo-blank.png")}
                                style={{ width: isCompactScreen ? 32 : 40, height: isCompactScreen ? 32 : 40 }}
                                contentFit="contain"
                            />
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Desktop navbar links */}
                    {!isCompactScreen && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
                            <TouchableOpacity onPress={() => scrollToSection("howItWorks")}>
                                <Text className="text-white font-semibold text-xs">{t("landing.nav_cra", "CRA")}</Text>
                            </TouchableOpacity>

                            <Text className="text-white/40 font-semibold">|</Text>

                            <TouchableOpacity onPress={() => scrollToSection("qna", 0.03)}>
                                <Text className="text-white font-semibold text-xs">{t("landing.nav_features", "Features, How does it work, FAQ")}</Text>
                            </TouchableOpacity>

                            <Text className="text-white/40 font-semibold">|</Text>

                            <TouchableOpacity onPress={() => scrollToSection("startNow")}>
                                <Text className="text-white font-semibold text-xs">{t("landing.nav_start_now", "Start now!")}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Right side: Language selector + LogIn and Mobile Menu Toggle */}
                    <Animated.View style={{ opacity: sideElementsOpacity, flexDirection: "row", alignItems: "center", gap: 10 }}>
                        {/* Language Selector Pill */}
                        <View className="flex-row items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
                            <TouchableOpacity onPress={() => changeLanguage("en")}>
                                <Text className={`text-xs ${currentLang.startsWith("en") ? "text-white font-semibold" : "text-white/50"}`}>
                                    EN
                                </Text>
                            </TouchableOpacity>
                            <Text className="text-white/40 text-xs">|</Text>
                            <TouchableOpacity onPress={() => changeLanguage("es")}>
                                <Text className={`text-xs ${currentLang.startsWith("es") ? "text-white font-semibold" : "text-white/50"}`}>
                                    ES
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            onPress={() => router.push("/login" as any)}
                            className="flex-row items-center"
                        >
                            <Text className="text-white font-semibold mr-1.5 text-xs">{t("landing.login", "LogIn")}</Text>
                            <Image
                                source={require("../assets/user-icon.png")}
                                style={{ width: isCompactScreen ? 22 : 28, height: isCompactScreen ? 22 : 28 }}
                                contentFit="contain"
                            />
                        </TouchableOpacity>

                        {isCompactScreen && (
                            <TouchableOpacity
                                onPress={() => setMobileMenuOpen((prev) => !prev)}
                                className="p-1.5 rounded-lg bg-white/10"
                                activeOpacity={0.7}
                            >
                                <Feather name={mobileMenuOpen ? "x" : "menu"} size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </Animated.View>

                {/* Mobile Dropdown Menu */}
                {isCompactScreen && mobileMenuOpen && (
                    <View
                        style={{
                            width: "92%",
                            backgroundColor: "#082444",
                            borderRadius: 16,
                            marginTop: 8,
                            paddingVertical: 12,
                            paddingHorizontal: 16,
                            borderWidth: 1,
                            borderColor: "rgba(255, 255, 255, 0.12)",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 10 },
                            shadowOpacity: 0.3,
                            shadowRadius: 15,
                            elevation: 10,
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => {
                                setMobileMenuOpen(false);
                                scrollToSection("howItWorks");
                            }}
                            style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.08)" }}
                        >
                            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>{t("landing.nav_cra", "CRA")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setMobileMenuOpen(false);
                                scrollToSection("qna", 0.03);
                            }}
                            style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255, 255, 255, 0.08)" }}
                        >
                            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>{t("landing.nav_features", "Features, How does it work, FAQ")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                setMobileMenuOpen(false);
                                scrollToSection("startNow");
                            }}
                            style={{ paddingVertical: 10 }}
                        >
                            <Text style={{ color: "white", fontWeight: "600", fontSize: 14 }}>{t("landing.nav_start_now", "Start now!")}</Text>
                        </TouchableOpacity>
                    </View>
                )}
           </Animated.View>

            <Animated.ScrollView
                ref={scrollViewRef}
                className={isAndroid ? "flex-1 bg-[#051b32]" : "flex-1 bg-gray-50"}
                contentContainerStyle={{ flexGrow: 1, width: "100%", paddingTop: BAR_HEIGHT_FULL + insets.top }}
                showsVerticalScrollIndicator={true}
                scrollEventThrottle={16}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
            >

            {/* Sección: How does it work? */}
            <View
                onLayout={(event) => {
                    sectionPositions.current["howItWorks"] = event.nativeEvent.layout.y;
                }}
            >
                <ImageBackground
                    source={require("../assets/index_bg.gif")}
                    resizeMode="cover"
                    style={{ width: "100%", height: SCREEN_HEIGHT * 1.1, bottom: SECTION_OVERLAP, padding: isAndroid ? 0 : SCREEN_WIDTH * 0.03, justifyContent: "center", alignItems: "center" }}
                >
                    <Image
                        source={require("../assets/WhiteFade.png")}
                        resizeMode="cover"
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "108%",
                            bottom: 0,
                            left: 0,
                        }}
                    />

                    <Index_CRA_Blur />
                    
                </ImageBackground>
            </View>

            {/* Sección: Q&A (el carrusel) */}
            <View
                onLayout={(event) => {
                    sectionPositions.current["qna"] = event.nativeEvent.layout.y;
                }}
            >
                <ImageBackground
                    source={qnaBackgroundSource}
                    resizeMode="cover"
                    style={{ width: isAndroid ? "105%" : "100%", height: isAndroid ? SCREEN_HEIGHT * 1.9 : SCREEN_HEIGHT * 1.1, bottom: SECTION_OVERLAP, padding: SCREEN_WIDTH * 0.05, justifyContent: "space-between" }}
                >
                    {!isAndroid && (
                        <View
                            style={{
                                position: "absolute",
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: "rgba(0,0,0,0.3)",
                            }}
                        />
                    )}

                    {Platform.OS !== "web" ? (
                        // MÓVIL (Android/iOS): swipe con scroll horizontal
                        <ScrollView
                            horizontal
                            pagingEnabled
                            nestedScrollEnabled={true}
                            showsHorizontalScrollIndicator={false}
                            onMomentumScrollEnd={(event) => {
                                const newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                                setSlideIndex(newIndex);
                            }}
                            style={{ flex: 1, zIndex: 5 }}
                        >
                            {carouselSlides.map((Slide, index) => (
                                <View key={index} style={{ width: SCREEN_WIDTH, flex: 1 }}>
                                    <Slide />
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        // WEB: botones de flecha, como antes
                        <>
                            {slideIndex > 0 && (
                                <TouchableOpacity
                                    onPress={() => goToSlide(slideIndex - 1)}
                                    style={{
                                        position: "absolute",
                                        left: SCREEN_WIDTH * 0.02,
                                        top: "50%",
                                        transform: [{ translateY: -(SCREEN_WIDTH * 0.045) }],
                                        width: SCREEN_WIDTH * 0.09,
                                        height: SCREEN_WIDTH * 0.09,
                                        borderRadius: 24,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 10,
                                    }}
                                >
                                    <Text style={{ color: "white", fontSize: SCREEN_WIDTH * 0.045, fontWeight: "600" }}>‹</Text>
                                </TouchableOpacity>
                            )}

                            {slideIndex < carouselSlides.length - 1 && (
                                <TouchableOpacity
                                    onPress={() => goToSlide(slideIndex + 1)}
                                    style={{
                                        position: "absolute",
                                        right: SCREEN_WIDTH * 0.02,
                                        top: "50%",
                                        transform: [{ translateY: -(SCREEN_WIDTH * 0.045) }],
                                        width: SCREEN_WIDTH * 0.09,
                                        height: SCREEN_WIDTH * 0.09,
                                        borderRadius: 24,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        zIndex: 10,
                                    }}
                                >
                                    <Text style={{ color: "white", fontSize: SCREEN_WIDTH * 0.045, fontWeight: "600" }}>›</Text>
                                </TouchableOpacity>
                            )}

                            <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                                <CurrentSlide />
                            </Animated.View>
                        </>
                    )}

                    <View
                        style={{
                            position: "absolute",
                            bottom: SCREEN_HEIGHT * 0.025,
                            left: 0,
                            right: 0,
                            flexDirection: "row",
                            justifyContent: "center",
                            gap: 8,
                        }}
                    >
                        {carouselSlides.map((_, i) => (
                            <View
                                key={i}
                                style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: 4,
                                    backgroundColor: i === slideIndex ? "white" : "rgba(255,255,255,0.4)",
                                }}
                            />
                        ))}
                    </View>
                    <Image
                        source={require("../assets/BlackFade2.png")}
                        resizeMode="cover"
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            width: isAndroid ? "108%" : "100%",
                            height: isAndroid ? "108%" : "100%",
                            bottom: -2,
                            left: 0,
                            zIndex: 0,   // 👈 la manda detrás de todo
                        }}
                    />

                </ImageBackground>
            </View>

            {/* Sección: Start now! */}
            <View
                onLayout={(event) => {
                    sectionPositions.current["startNow"] = event.nativeEvent.layout.y;
                }}
            >
                <ImageBackground
                    source={require("../assets/index_bg_5.gif")}
                    resizeMode="cover"
                    style={{ width: "100%", height: isAndroid ? SCREEN_HEIGHT * 0.8 : SCREEN_HEIGHT * 1.1, bottom:  SECTION_OVERLAP }}
                >
                    <Image
                        source={require("../assets/BlackFade.png")}
                        resizeMode="cover"
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                            left: isAndroid ? 0 : 0,
                            opacity: isAndroid ? 0.9 : 1,
                        }}
                    />

                    <View
                        style={{
                            flex: 1,
                            bottom: isAndroid ? "-8%" : 0,
                            alignItems: "flex-end",
                            right: isAndroid ? 0 : SCREEN_WIDTH * 0.05,
                        }}
                    >
                        <Index_Start_Message />
                    </View>
                </ImageBackground>
            </View>
            

            </Animated.ScrollView>
        </View>
    );
}