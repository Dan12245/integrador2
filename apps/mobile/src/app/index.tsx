import { useEffect, useRef, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, ImageBackground, ScrollView, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import { usePostHog } from "../lib/posthog";

import { Image } from "expo-image";

import Index_CRA_Blur from "../components/Index_CRA_Blur";
import Index_Start_Message from "../components/Index_Start_Message";
import Index_Page1 from "../components/Index_Page1";
import Index_Page2 from "../components/Index_Page2";
import Index_Page3 from "../components/Index_Page3";
import Index_Page4 from "../components/Index_Page4";
import { useSafeAreaInsets } from "react-native-safe-area-context";


const carouselSlides = [Index_Page1, Index_Page2, Index_Page3, Index_Page4];

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const BAR_HEIGHT_FULL = 60;
const BAR_HEIGHT_COMPACT = 50;
const BAR_WIDTH_COMPACT = 700;
const SCROLL_RANGE = 80;

export default function LandingScreen() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [slideIndex, setSlideIndex] = useState(0);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const scrollY = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef<ScrollView>(null);
    const router = useRouter();
    const posthog = usePostHog();

    // Guardamos la posición Y de cada sección aquí
    const sectionPositions = useRef<{ [key: string]: number }>({});

    const scrollToSection = (key: string) => {
        const y = sectionPositions.current[key];
        if (y !== undefined && scrollViewRef.current) {
            scrollViewRef.current.scrollTo({ y: y - 80, animated: true }); // 👈 ajusta el 100
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
        outputRange: [1, 0],
        extrapolate: "clamp",
    });

    const insets = useSafeAreaInsets();

    return (
        
        <View className="flex-1 bg-[#051b32]">
        
            <View
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 20,
                    alignItems: "center",
                    paddingTop: insets.top,
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
                        paddingHorizontal: 16,
                        overflow: "hidden",
                    }}
                >
                    <Animated.View style={{ opacity: sideElementsOpacity }}>
                        <Image
                            source={require("../assets/logo-blank.png")}
                            style={{ width: 80, height: 36 }}
                            resizeMode="contain"
                        />
                    </Animated.View>

                    <TouchableOpacity onPress={() => scrollToSection("howItWorks")}>
                        <Text className="text-white font-semibold text-xs">Index</Text>
                    </TouchableOpacity>

                    <Text className="text-white font-semibold">|</Text>

                    <TouchableOpacity onPress={() => scrollToSection("qna")}>
                        <Text className="text-white font-semibold text-xs">Features, How does it work, FAQ</Text>
                    </TouchableOpacity>

                    <Text className="text-white font-semibold">|</Text>

                    <TouchableOpacity onPress={() => scrollToSection("startNow")}>
                        <Text className="text-white font-semibold text-xs">Start now!</Text>
                    </TouchableOpacity>

                    <Animated.View style={{ opacity: sideElementsOpacity }}>
                        <TouchableOpacity
                            onPress={() => router.push("/login" as any)}
                            className="flex-row items-center"
                        >
                            <Text className="text-white font-semibold mr-2 text-xs">LogIn</Text>
                            <Image
                                source={require("../assets/user-icon.png")}
                                style={{ width: 30, height: 30 }}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>
            </View>

            <Animated.ScrollView
                ref={scrollViewRef}
                className="flex-1 bg-gray-50"
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
                    className="w-full h-[500px] p-6 justify-between"
                    style={{ width: "100%", height: 700, bottom: 60 }}
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
                    source={require("../assets/index_bg_2.gif")}
                    resizeMode="cover"
                    className="w-full h-[500px] p-6 justify-between"
                    style={{ width: "100%", height: 700, bottom: 60 }}
                >

                    <View
                        style={{
                            position: "absolute",
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: "rgba(255,255,255,0.5)",
                        }}
                    />

                    {slideIndex > 0 && (
                        <TouchableOpacity
                            onPress={() => goToSlide(slideIndex - 1)}
                            style={{
                                position: "absolute",
                                left: 16,
                                top: "50%",
                                transform: [{ translateY: -24 }],
                                width: 70,
                                height: 70,
                                borderRadius: 24,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 10,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "600", bottom: 3 }}>‹</Text>
                        </TouchableOpacity>
                    )}

                    {slideIndex < carouselSlides.length - 1 && (
                        <TouchableOpacity
                            onPress={() => goToSlide(slideIndex + 1)}
                            style={{
                                position: "absolute",
                                right: 16,
                                top: "50%",
                                transform: [{ translateY: -24 }],
                                width: 70,
                                height: 70,
                                borderRadius: 24,
                                backgroundColor: "rgba(0,0,0,0.5)",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 10,
                            }}
                        >
                            <Text style={{ color: "white", fontSize: 24, fontWeight: "600", bottom: 3 }}>›</Text>
                        </TouchableOpacity>
                    )}

                    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                        <CurrentSlide />
                    </Animated.View>

                    <View
                        style={{
                            position: "absolute",
                            bottom: 20,
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
                            width: "100%",
                            height: "108%",
                            bottom: -2,
                            left: 0,
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
                    style={{ width: "100%", height: 700, bottom: 60 }}
                >
                    <Image
                        source={require("../assets/BlackFade.png")}
                        resizeMode="cover"
                        pointerEvents="none"
                        style={{
                            position: "absolute",
                            width: "100%",
                            height: "100%",
                        }}
                    />

                    <View
                        style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "flex-end",
                            right: 80,
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