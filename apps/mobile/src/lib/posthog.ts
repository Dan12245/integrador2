import { Platform } from "react-native";
import PostHogNative, { PostHogProvider as NativeProvider, usePostHog as usePostHogNative } from "posthog-react-native";
import posthogWeb from "posthog-js";
import { PostHogProvider as WebProvider, usePostHog as usePostHogWeb } from "posthog-js/react";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || "placeholder_key";
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const isPostHogConfigured = apiKey && apiKey !== "phc_your_project_token_here";

export let posthog: any;
export let PostHogProvider: any;
export let usePostHog: any;

if (Platform.OS === "web") {
  if (typeof window !== "undefined") {
    posthogWeb.init(apiKey, {
      api_host: host,
      // Enable session replay
      disable_session_recording: !isPostHogConfigured,
      session_recording: {
        maskAllInputs: true,
      },
      // Other web settings
      loaded: (ph) => {
        if (!isPostHogConfigured) {
          ph.opt_out_capturing();
        }
      },
    });
  }
  posthog = posthogWeb;
  PostHogProvider = WebProvider;
  usePostHog = usePostHogWeb;
} else {
  posthog = new PostHogNative(apiKey, {
    host,
    disabled: !isPostHogConfigured,
    persistence: "memory", // Crucial for Expo SDK 54
    enableSessionReplay: true,
    sessionReplayConfig: {
      maskAllTextInputs: true,
      maskAllImages: false,
    },
    captureAppLifecycleEvents: true,
    flushAt: 20,
    flushInterval: 10000,
    preloadFeatureFlags: true,
  });
  PostHogProvider = NativeProvider;
  usePostHog = usePostHogNative;
}
