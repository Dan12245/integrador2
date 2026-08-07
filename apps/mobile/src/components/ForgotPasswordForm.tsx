import React, { useState, useEffect } from "react";
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";
import { Feather } from "@expo/vector-icons";
import * as Linking from "expo-linking";

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [step, setStep] = useState<"request" | "reset" | "success">("request");
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [cooldown, setCooldown] = useState<number>(0);
    const [warningMessage, setWarningMessage] = useState<string | null>(null);

    const router = useRouter();
    const posthog = usePostHog();

    // 1. Listen for recovery sessions and auth events
    useEffect(() => {
        // Check if user is already authenticated via a deep link recovery session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setStep("reset");
                if (session.user?.email) {
                    setEmail(session.user.email);
                }
            }
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
                setStep("reset");
                if (session?.user?.email) {
                    setEmail(session.user.email);
                }
            }
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // 2. Cooldown countdown timer effect
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setInterval(() => {
            setCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldown]);

    // 3. Handle sending the password reset email
    async function handleRequestReset() {
        if (!email.trim()) {
            Alert.alert("Error", "Please enter your email address");
            return;
        }

        if (cooldown > 0) {
            Alert.alert(
                "Too Many Requests",
                `For security purposes, please wait ${cooldown} seconds before requesting another reset email.`,
            );
            return;
        }

        setLoading(true);
        setWarningMessage(null);
        try {
            const redirectUrl = Linking.createURL("/forgot-password");
            const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
                redirectTo: redirectUrl,
            });

            if (error) {
                const isRateLimit =
                    error.status === 429 ||
                    error.message?.toLowerCase().includes("rate limit") ||
                    error.message?.toLowerCase().includes("security purposes") ||
                    error.message?.toLowerCase().includes("too many requests") ||
                    error.message?.toLowerCase().includes("for security");

                if (isRateLimit) {
                    setCooldown(60);
                    const msg =
                        error.message ||
                        "Too many requests. For security purposes, please wait before requesting another email.";
                    setWarningMessage(msg);
                    posthog.capture("forgot_password_rate_limited", { email: email.trim() });
                } else {
                    Alert.alert("Error", error.message);
                    posthog.capture("forgot_password_failed", { error_message: error.message });
                }
            } else {
                setEmailSent(true);
                setCooldown(60);
                setWarningMessage(null);
                posthog.capture("forgot_password_requested", { email: email.trim() });
            }
        } catch (err: any) {
            Alert.alert("Error", err?.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    // 4. Handle updating the password
    async function handleResetPassword() {
        if (!newPassword || !confirmPassword) {
            Alert.alert("Error", "Please enter and confirm your new password");
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("Error", "Password must be at least 6 characters long");
            return;
        }

        setLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                Alert.alert("Error", updateError.message);
                posthog.capture("password_reset_failed", { error_message: updateError.message });
            } else {
                posthog.capture("password_reset_success");
                // Sign out temporary recovery session so user logs in cleanly
                await supabase.auth.signOut();
                setStep("success");
            }
        } catch (err: any) {
            Alert.alert("Error", err?.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    }

    // View 1: Success confirmation view
    if (step === "success") {
        return (
            <View className="flex-1 justify-center p-6 bg-white w-full max-w-md self-center">
                <View className="items-center mb-6">
                    <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                        <Text className="text-3xl">✓</Text>
                    </View>
                    <Text className="text-2xl font-extrabold text-gray-900 tracking-tight text-center mb-2">
                        Password Updated!
                    </Text>
                    <Text className="text-gray-600 text-center text-base leading-6">
                        Your password has been changed successfully. You can now sign in using your
                        new password.
                    </Text>
                </View>

                <TouchableOpacity
                    testID="success_sign_in_button"
                    className="w-full bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 mb-4"
                    onPress={() => router.replace("/login" as any)}
                >
                    <Text className="text-white text-base font-semibold">Continue to Sign In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // View 2: New password entry form
    if (step === "reset") {
        return (
            <View className="flex-1 justify-center p-6 bg-white w-full max-w-md self-center">
                <View className="mb-6">
                    <Text className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                        Set New Password
                    </Text>
                    <Text className="text-gray-500">
                        {email
                            ? `Enter a new password for ${email}`
                            : "Please enter and confirm your new password."}
                    </Text>
                </View>

                <View className="flex flex-col gap-4 mb-6">
                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            New Password
                        </Text>
                        <TextInput
                            testID="new_password_field"
                            onChangeText={(text) => setNewPassword(text)}
                            value={newPassword}
                            secureTextEntry={true}
                            placeholder="At least 6 characters"
                            autoCapitalize="none"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                        </Text>
                        <TextInput
                            testID="confirm_password_field"
                            onChangeText={(text) => setConfirmPassword(text)}
                            value={confirmPassword}
                            secureTextEntry={true}
                            placeholder="Re-enter your new password"
                            autoCapitalize="none"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
                        />
                    </View>
                </View>

                <View className="flex flex-col gap-3">
                    <TouchableOpacity
                        testID="reset_password_button"
                        className={`w-full bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 ${
                            loading ? "opacity-50" : ""
                        }`}
                        onPress={handleResetPassword}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-white text-base font-semibold">
                                Update Password
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        testID="back_to_login_button"
                        onPress={() => router.replace("/login" as any)}
                        className="w-full py-2 items-center mt-2"
                    >
                        <Text className="text-indigo-600 font-medium">Back to Sign In</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    // View 3: Request reset link form & email sent confirmation
    return (
        <View className="flex-1 justify-center p-6 bg-white w-full max-w-md self-center">
            <View className="mb-6">
                <Text className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Reset Password
                </Text>
                <Text className="text-gray-500">
                    Enter your email address and we'll send you a link to reset your password.
                </Text>
            </View>

            {/* Warning message from rate limits or errors */}
            {warningMessage && (
                <View className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl mb-4">
                    <Text className="text-amber-800 text-xs font-semibold text-center">
                        {warningMessage}
                    </Text>
                </View>
            )}

            {/* Email Sent Confirmation Card */}
            {emailSent ? (
                <View className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl mb-6">
                    <View className="flex-row items-center mb-2">
                        <Feather className="mr-2" name="mail" size={24} color="#065F46" />
                        <Text className="text-emerald-900 font-bold text-base">
                            Check your email
                        </Text>
                    </View>
                    <Text className="text-emerald-800 text-sm leading-5">
                        We've sent a password reset link to{" "}
                        <Text className="font-semibold">{email}</Text>. Click the link in the email
                        to set your new password.
                    </Text>
                </View>
            ) : (
                <View className="mb-6">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
                    <TextInput
                        testID="forgot_email_field"
                        onChangeText={(text) => setEmail(text)}
                        value={email}
                        placeholder="you@example.com"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
                    />
                </View>
            )}

            <View className="flex flex-col gap-3">
                {emailSent ? (
                    <>
                        {/* Resend Action with 60s cooldown limit */}
                        <TouchableOpacity
                            testID="resend_reset_email_button"
                            className={`w-full py-3.5 rounded-xl items-center justify-center border ${
                                cooldown > 0 || loading
                                    ? "border-gray-200 bg-gray-100 opacity-60"
                                    : "border-indigo-600 bg-indigo-50"
                            }`}
                            onPress={handleRequestReset}
                            disabled={cooldown > 0 || loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#4F46E5" />
                            ) : (
                                <Text
                                    className={`text-sm font-semibold ${
                                        cooldown > 0 ? "text-gray-500" : "text-indigo-600"
                                    }`}
                                >
                                    {cooldown > 0
                                        ? `Resend email in ${cooldown}s`
                                        : "Didn't receive the email? Resend"}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="change_email_button"
                            onPress={() => setEmailSent(false)}
                            className="w-full py-2 items-center"
                        >
                            <Text className="text-gray-600 text-sm font-medium">
                                Try a different email address
                            </Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <TouchableOpacity
                        testID="send_reset_email_button"
                        className={`w-full bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 ${
                            loading || cooldown > 0 ? "opacity-50" : ""
                        }`}
                        onPress={handleRequestReset}
                        disabled={loading || cooldown > 0}
                    >
                        {loading ? (
                            <ActivityIndicator color="#ffffff" />
                        ) : (
                            <Text className="text-white text-base font-semibold">
                                {cooldown > 0 ? `Wait ${cooldown}s to request` : "Send Reset Link"}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}

                <TouchableOpacity
                    testID="back_to_login_button"
                    onPress={() => {
                        posthog.capture("back_to_login_tapped");
                        router.push("/login" as any);
                    }}
                    className="w-full py-2 items-center mt-2"
                >
                    <Text className="text-indigo-600 font-medium">Back to Sign In</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
