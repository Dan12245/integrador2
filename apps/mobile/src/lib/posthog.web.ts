import posthogWeb from "posthog-js";
import { PostHogProvider as WebProvider, usePostHog as usePostHogWeb } from "posthog-js/react";

const apiKey = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN || "placeholder_key";
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";
const isPostHogConfigured = apiKey && apiKey !== "phc_your_project_token_here";

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

export const posthog = posthogWeb;
export const PostHogProvider = WebProvider;
export const usePostHog = usePostHogWeb;
