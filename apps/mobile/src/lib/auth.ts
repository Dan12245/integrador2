import { Alert, Platform } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "./supabase";

if (Platform.OS === "web") {
  WebBrowser.maybeCompleteAuthSession();
}

export function getQueryParam(url: string, param: string): string | null {
  try {
    const searchPart = url.includes("?") ? url.split("?")[1].split("#")[0] : "";
    const params = new URLSearchParams(searchPart);
    const val = params.get(param);
    if (val) return val;
  } catch (e) {}

  try {
    const hashPart = url.includes("#") ? url.split("#")[1] : "";
    const params = new URLSearchParams(hashPart);
    const val = params.get(param);
    if (val) return val;
  } catch (e) {}

  const regex = new RegExp(`[?&#]${param}=([^&#]*)`);
  const match = url.match(regex);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function handleAuthRedirectUrl(url: string) {
  console.log("[Auth] Processing Auth Redirect URL:", url);

  const errorDesc = getQueryParam(url, "error_description") || getQueryParam(url, "error");
  if (errorDesc) {
    console.error("[Auth] OAuth Redirect Error:", errorDesc);
    Alert.alert("Authentication Error", errorDesc);
    return null;
  }

  const code = getQueryParam(url, "code");
  if (code) {
    console.log("[Auth] Found PKCE authorization code, exchanging for session...");
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[Auth] exchangeCodeForSession error:", error.message);
        Alert.alert("Google Sign-In Error", error.message);
        throw error;
      }
      console.log("[Auth] Code exchange successful! Session user:", data?.user?.email);
      return data;
    } catch (err: any) {
      console.error("[Auth] Exception during code exchange:", err?.message || err);
      throw err;
    }
  }

  const accessToken = getQueryParam(url, "access_token");
  const refreshToken = getQueryParam(url, "refresh_token");

  if (accessToken && refreshToken) {
    console.log("[Auth] Found implicit tokens, setting session...");
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) {
        console.error("[Auth] setSession error:", error.message);
        Alert.alert("Google Sign-In Error", error.message);
        throw error;
      }
      console.log("[Auth] setSession successful! Session user:", data?.user?.email);
      return data;
    } catch (err: any) {
      console.error("[Auth] Exception during setSession:", err?.message || err);
      throw err;
    }
  }

  console.warn("[Auth] No authorization code or session tokens found in URL:", url);
  return null;
}

export async function performGoogleSignIn() {
  const redirectUrl = Linking.createURL("/");
  console.log("[Auth] Google Sign-In redirectUrl:", redirectUrl);

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
    console.log("[Auth] Opening WebBrowser auth session with URL:", data.url);
    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl, {
      showInRecents: true,
    });
    console.log("[Auth] WebBrowser result:", JSON.stringify(result));

    if (result.type === "success" && result.url) {
      return await handleAuthRedirectUrl(result.url);
    }

    // Fallback: On Android with external browsers (e.g. Firefox during 2FA),
    // openAuthSessionAsync may return type: "dismiss" or "cancel" when deep link intent opens app.
    if (result.type === "dismiss" || result.type === "cancel") {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && (initialUrl.includes("code=") || initialUrl.includes("access_token="))) {
        console.log("[Auth] Recovered deep link URL after browser dismiss:", initialUrl);
        return await handleAuthRedirectUrl(initialUrl);
      }
    }
  }
}
