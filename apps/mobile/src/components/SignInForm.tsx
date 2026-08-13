import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";

import { BlurView } from "expo-blur";

import { Image } from "expo-image";


export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const posthog = usePostHog();

    async function signInWithEmail() {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });


        if (error) {
            Alert.alert("Error", error.message);
            posthog.capture("sign_in_failed", { error_message: error.message });
        } else {
            posthog.identify(email, {
                $set: { email },
                $set_once: { first_sign_in_date: new Date().toISOString() },
            });
            posthog.capture("user_signed_in");
        }
        setLoading(false);
    }

    return (
        <View style={{ position: "relative", alignItems: "center" }}>
            
            {/* Logo flotando ARRIBA y AFUERA del BlurView */}
            <Image
                source={require("../assets/logo.png")}
                style={{
                    position: "absolute",
                    top: -110, // ajusta este valor para controlar cuánto sobresale
                    left: "33%", // ajusta este valor para centrar horizontalmente
                    width: 140,
                    height: 140,
                    zIndex: 2,
                }}
                contentFit="cover"
            />

            <BlurView intensity={50} tint="light" className="w-96 flex-1 justify-center p-6 bg-white rounded-2xl">
                <View className="flex flex-col gap-4 mb-8">
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
                        <TextInput
                            testID="login_email_field"
                            onChangeText={(text) => setEmail(text)}
                            value={email}
                            placeholder="you@example.com"
                            autoCapitalize="none"
                            keyboardType="email-address"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
                        <TextInput
                            testID="login_password_field"
                            onChangeText={(text) => setPassword(text)}
                            value={password}
                            secureTextEntry={true}
                            placeholder="••••••••"
                            autoCapitalize="none"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
                        />
                    </View>
                </View>

                <View className="flex flex-col gap-4">
                    <TouchableOpacity
                        testID="sign_in_confirmation"
                        className={`w-full bg-[#051b32] py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 ${loading ? "opacity-50" : ""}`}
                        onPress={signInWithEmail}
                        disabled={loading}
                    >
                        <Text className="text-white text-base font-semibold">
                            {loading ? "Signing in..." : "Sign In"}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        testID="sign_up_redirect"
                        onPress={() => {
                            posthog.capture("sign_up_redirect_tapped");
                            router.push("/register" as any);
                        }}
                        className="w-full py-2 items-center"
                    >
                        <Text className="text-indigo-600 font-medium">
                            Don&apos;t have an account? Sign Up
                        </Text>
                    </TouchableOpacity>
                </View>
            </BlurView>
        </View>
    );
}