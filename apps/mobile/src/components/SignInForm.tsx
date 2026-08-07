import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";
import { performGoogleSignIn } from "../lib/auth";
import GoogleIcon from "./GoogleIcon";

export default function SignInForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
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

    async function handleGoogleSignIn() {
        setGoogleLoading(true);
        posthog.capture("google_sign_in_initiated");
        try {
            const sessionData = await performGoogleSignIn();
            if (sessionData?.user?.email) {
                posthog.identify(sessionData.user.email, {
                    $set: { email: sessionData.user.email },
                    $set_once: { first_sign_in_date: new Date().toISOString() },
                });
            }
            posthog.capture("user_signed_in_google");
            if (sessionData?.session) {
                router.replace("/home" as any);
            }
        } catch (error: any) {
            if (error?.message && !error.message.includes("cancel")) {
                Alert.alert("Google Sign-In Error", error.message);
            }
            posthog.capture("google_sign_in_failed", { error_message: error?.message });
        } finally {
            setGoogleLoading(false);
        }
    }

    return (
        <View className="flex-1 justify-center p-6 bg-white w-full max-w-md self-center">
            <View className="mb-8">
                <Text className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Welcome to CRA
                </Text>
                <Text className="text-gray-500">Sign in to manage your account and profile</Text>
            </View>

            <TouchableOpacity
                testID="google_sign_in_button"
                className={`w-full bg-white border border-gray-300 py-3.5 px-4 rounded-xl mb-6 shadow-sm active:bg-gray-50 ${googleLoading ? "opacity-50" : ""}`}
                onPress={handleGoogleSignIn}
                disabled={googleLoading || loading}
            >
                <View className="flex-row items-center justify-center w-full">
                    <GoogleIcon size={20} style={{ marginRight: 12 }} />
                    <Text className="text-gray-800 text-base font-semibold">
                        {googleLoading ? "Connecting to Google..." : "Continue with Google"}
                    </Text>
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Or continue with email
                </Text>
                <View className="flex-1 h-px bg-gray-200" />
            </View>

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
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-sm font-semibold text-gray-700">Password</Text>
                    </View>

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
                <TouchableOpacity
                    testID="forgot_password_button"
                    className=""
                    onPress={() => {
                        posthog.capture("forgot_password_tapped");
                        router.push("/forgot-password" as any);
                    }}
                >
                    <Text className="text-xs text-right font-semibold text-indigo-600">
                        Forgot password?
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex flex-col gap-4">
                <TouchableOpacity
                    testID="sign_in_confirmation"
                    className={`w-full bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 ${loading ? "opacity-50" : ""}`}
                    onPress={signInWithEmail}
                    disabled={loading || googleLoading}
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
        </View>
    );
}
