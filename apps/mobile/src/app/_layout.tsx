import "../../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { supabase } from "../lib/supabase";
import { handleAuthRedirectUrl } from "../lib/auth";
import * as Linking from "expo-linking";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { ActivityIndicator, View } from "react-native";
import { posthog, PostHogProvider } from "../lib/posthog";
import { DarkTheme } from "@react-navigation/native";

export default function RootLayout() {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const segments = useSegments();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname && posthog) {
            if (typeof posthog.screen === "function") {
                posthog.screen(pathname);
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

        if (!session && inAppGroup) {
            // If NOT logged in, and trying to access protected screens, redirect to login
            router.replace("/login" as any);
        } else if (session && !inAppGroup) {
            // If logged in, and NOT in app group (e.g. on auth or landing screens), redirect to home
            router.replace("/home" as any);
        }
    }, [session, loading, segments]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    // 3. Render layouts
    return (
        <PostHogProvider
            client={posthog}
            autocapture={{
                captureScreens: false,
                captureTouches: false,
                propsToCapture: ["testID"],
            }}
        >
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(app)" />
            </Stack>
        </PostHogProvider>
    );
}
