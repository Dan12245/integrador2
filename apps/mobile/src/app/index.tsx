import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export default function LandingScreen() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Reanimated state
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }],
        };
    });

    const handleAnimate = () => {
        // Generate a random scale factor between 0.6 and 2.0
        const randomScale = 0.6 + Math.random() * 1.4;
        scale.value = withSpring(randomScale);
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

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    // If already logged in, we are redirecting, so keep showing loader
    if (session) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 p-6 justify-between">
            <View className="mt-[60px] items-center">
                <Text className="text-[32px] font-extrabold text-gray-900 text-center mb-6">
                    Hello, tilin
                </Text>
                <Text className="text-red-500 text-center"> Puro CRA </Text>
            </View>

            {/* Reanimated test button */}
            <View className="items-center justify-center my-10">
                <Animated.View style={animatedStyle}>
                    <TouchableOpacity
                        className="bg-indigo-600 px-6 py-4 rounded-xl items-center shadow-lg shadow-indigo-600/30"
                        onPress={handleAnimate}
                    >
                        <Text className="text-white text-base font-semibold">Test Reanimated</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>

            <View className="mb-10">
                <TouchableOpacity
                    testID="get_started"
                    className="bg-indigo-600 py-5 rounded-xl items-center"
                    onPress={() => router.push("/login" as any)}
                >
                    <Text className="text-white text-base font-semibold">Get Started</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
