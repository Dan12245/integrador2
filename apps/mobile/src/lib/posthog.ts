import PostHog from "posthog-react-native";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const isPostHogConfigured = apiKey && apiKey !== "phc_your_project_token_here";

export const posthog = new PostHog(apiKey || "placeholder_key", {
  host,
  disabled: !isPostHogConfigured,
  captureAppLifecycleEvents: true,
  flushAt: 20,
  flushInterval: 10000,
  preloadFeatureFlags: true,
});
