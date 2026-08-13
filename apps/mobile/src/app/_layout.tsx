import "../../global.css";
import "../i18n";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/supabase";
import { handleAuthRedirectUrl } from "../lib/auth";
import * as Linking from "expo-linking";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { ActivityIndicator, View, Platform, useWindowDimensions } from "react-native";
import { posthog, PostHogProvider } from "../lib/posthog";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();
    const pathname = usePathname();
    const { width } = useWindowDimensions();

    const isWebWideScreen = Platform.OS === "web" && width >= 768;

    useEffect(() => {
        if (pathname && posthog) {
            if (typeof (posthog as any).screen === "function") {
                (posthog as any).screen(pathname);
            } else if (typeof posthog.capture === "function") {
                posthog.capture("$pageview", { $current_url: pathname });
            }
        }
    }, [pathname]);

    // 1. Listen to deep links for OAuth authentication redirects
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            console.log("[RootLayout] Deep link received:", event.url);
            if (event.url && (event.url.includes("code=") || event.url.includes("access_token="))) {
                try {
                    await handleAuthRedirectUrl(event.url);
                } catch (err) {
                    console.error("[RootLayout] Deep link auth error:", err);
                }
            }
        };

        Linking.getInitialURL().then((url) => {
            if (url && (url.includes("code=") || url.includes("access_token="))) {
                handleDeepLink({ url });
            }
        });

        const subscription = Linking.addEventListener("url", handleDeepLink);
        return () => subscription.remove();
    }, []);

    // 2. Listen to auth state changes
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                console.log(
                    "[RootLayout] onAuthStateChange event:",
                    _event,
                    "User:",
                    session?.user?.email,
                );
                setSession(session);
                setLoading(false);
            },
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    // 3. Protect routes reactively
    useEffect(() => {
        if (loading) return;

        // Check if the user is currently in the "(app)" group
        const inAppGroup = (segments[0] as string) === "(app)";
        const isResetPasswordScreen = (segments[0] as string) === "(auth)" && (segments[1] === "forgot-password" || segments[1] === "reset-password");

        if (!session && inAppGroup) {
            // If NOT logged in, and trying to access protected screens, redirect to login
            router.replace("/login" as any);
        } else if (session && !inAppGroup && !isResetPasswordScreen) {
            // If logged in, and NOT in app group and NOT on reset password screen, redirect to home
            router.replace("/home" as any);
        }
    }, [session, loading, segments]);

    if (loading) {
        return (
            <SafeAreaProvider>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fafc" }}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            </SafeAreaProvider>
        );
    }

    // 4. Render layouts with Safe Area Provider and flexible responsive container
    return (
        <SafeAreaProvider>
            <PostHogProvider client={posthog}>
                <KeyboardProvider statusBarTranslucent>
                    <StatusBar style="dark" />
                    <View
                        style={{
                            flex: 1,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "#051b32",
                        }}
                    >
                        <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen name="index" />
                            <Stack.Screen name="(auth)" />
                            <Stack.Screen name="(app)" />
                        </Stack>
                    </View>
                </KeyboardProvider>
            </PostHogProvider>
        </SafeAreaProvider>
    );
}


