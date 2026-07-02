import "../../global.css";
import { useEffect, useState } from "react";
import { Stack, useRouter, useSegments, usePathname } from "expo-router";
import { supabase } from "../lib/supabase";
import { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { ActivityIndicator, View } from "react-native";
import { PostHogProvider } from "posthog-react-native";
import { posthog } from "../lib/posthog";

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && posthog) {
      posthog.screen(pathname);
    }
  }, [pathname]);

  // 1. Listen to auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Protect routes reactively
  useEffect(() => {
    if (loading) return;

    // Check if the user is currently in the "(auth)" group or "(app)" group
    const inAppGroup = (segments[0] as string) === "(app)";
    const inAuthGroup = (segments[0] as string) === "(auth)";

    if (!session && inAppGroup) {
      // If NOT logged in, and trying to access protected screens, redirect to login
      router.replace("/login" as any);
    } else if (session && inAuthGroup) {
      // If logged in, and trying to access auth screens, redirect to home
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
        captureTouches: true,
        propsToCapture: ["testID"],
      }}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
    </PostHogProvider>
  );
}
