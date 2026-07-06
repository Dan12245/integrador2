import PostHogNative, { PostHogProvider as NativeProvider, usePostHog as usePostHogNative } from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || "placeholder_key";
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const isPostHogConfigured = apiKey && apiKey !== "phc_your_project_token_here";

export const posthog = new PostHogNative(apiKey, {
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

export const PostHogProvider = NativeProvider;
export const usePostHog = usePostHogNative;

