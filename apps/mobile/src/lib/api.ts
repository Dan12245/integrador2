import Constants from "expo-constants";
import { Platform } from "react-native";

/**
 * Dynamically resolves the API base URL.
 * Priority order:
 * 1. EXPO_PUBLIC_API_URL environment variable (if set in .env)
 * 2. Metro Bundler host IP address (for physical devices & development builds)
 * 3. Platform fallback (http://10.0.2.2:8787 for Android Emulator, http://localhost:8787 for Web/iOS Simulator)
 */
export const getApiUrl = (): string => {
    if (process.env.EXPO_PUBLIC_API_URL) {
        return process.env.EXPO_PUBLIC_API_URL;
    }

    return "https://api.alexitrix.workers.dev";
};
