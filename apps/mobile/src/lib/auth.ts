import { Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export async function performGoogleSignIn() {
  const redirectUrl = Linking.createURL("/");

  if (Platform.OS === "web") {
    // On Web, direct page redirect avoids popup COOP / window.close blocking issues
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
    if (error) throw error;
    return;
  }

  // Native mobile (iOS & Android) in-app auth session flow
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

    if (result.type === "success" && result.url) {
      // 1. Check for PKCE authorization code in URL
      const urlObj = new URL(result.url);
      const code = urlObj.searchParams.get("code");

      if (code) {
        const { data: sessionData, error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
        return sessionData;
      }

      // 2. Check for implicit access_token and refresh_token fallback
      let accessToken = urlObj.searchParams.get("access_token");
      let refreshToken = urlObj.searchParams.get("refresh_token");

      if (!accessToken || !refreshToken) {
        const hash = urlObj.hash || (result.url.includes("#") ? result.url.split("#")[1] : "");
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          accessToken = accessToken || hashParams.get("access_token");
          refreshToken = refreshToken || hashParams.get("refresh_token");
        }
      }

      if (accessToken && refreshToken) {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        if (sessionError) throw sessionError;
        return sessionData;
      }
    }
  }
}
