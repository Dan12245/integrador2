import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";
import { performGoogleSignIn } from "../lib/auth";
import GoogleIcon from "./GoogleIcon";
import { useTranslation } from "react-i18next";

export default function SignInForm() {
  const { t } = useTranslation();
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [loading, setLoading]             = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const router  = useRouter();
  const posthog = usePostHog();
  const { width } = useWindowDimensions();

  const isSmall = width < 480;

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert(t('login.error_title'), t('login.error_empty'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      Alert.alert(t('login.error_title'), error.message);
      posthog.capture("sign_in_failed", { error_message: error.message });
    } else {
      posthog.identify(email, {
        $set: { email },
        $set_once: { first_sign_in_date: new Date().toISOString() },
      });
      posthog.capture("user_signed_in");
    }
    setLoading(false);
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    posthog.capture("google_sign_in_initiated");
    try {
      const sessionData = await performGoogleSignIn();
      if (sessionData?.user?.email) {
        posthog.identify(sessionData.user.email, {
          $set: { email: sessionData.user.email },
          $set_once: { first_sign_in_date: new Date().toISOString() },
        });
      }
      posthog.capture("user_signed_in_google");
      if (sessionData?.session) {
        router.replace("/home" as any);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes("cancel")) {
        Alert.alert(t('login.google_error_title'), error.message);
      }
      posthog.capture("google_sign_in_failed", { error_message: error?.message });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center items-center px-6">

      {/*LOGO CRA*/}
      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        style={{
          width: isSmall ? 150 : 170,
          height: isSmall ? 150 : 170,
          marginBottom: isSmall ? -60 : -70,
          zIndex: 10,
        }}
      >
        <Image
          source={require("../assets/images/cra-logo.png")}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </Animated.View>

      {/*TARJETA PRINCIPAL*/}
      <Animated.View
        entering={FadeInUp.delay(150).duration(450).springify()}
        style={{
          width: "100%",
          maxWidth: 680,
          backgroundColor: "rgba(255,255,255,0.5)",
          borderRadius: isSmall ? 32 : 40,
          paddingTop: isSmall ? 85 : 95,
          paddingBottom: isSmall ? 36 : 46,
          paddingHorizontal: isSmall ? 28 : 46,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
          elevation: 10,
        }}
      >
        {/*CAMPO: Username/Email*/}
        <Animated.View entering={FadeInDown.delay(250).duration(350)}>
          <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-6 py-4 mb-4 border border-gray-200">
            {/* Ícono a la izquierda, dentro del campo */}
            <Feather name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              testID="login_email_field"
              onChangeText={setEmail}
              value={email}
              placeholder={t('login.username_placeholder')}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-lg text-gray-800"
            />
          </View>
        </Animated.View>

        {/*CAMPO: Password con botón para mostrar/ocultar*/}
        <Animated.View entering={FadeInDown.delay(320).duration(350)}>
          <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-6 py-4 mb-3 border border-gray-200">
            {/* Icono de candado a la izquierda */}
            <Feather name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              testID="login_password_field"
              onChangeText={setPassword}
              value={password}
              secureTextEntry={!showPassword}
              placeholder={t('login.password_placeholder')}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-lg text-gray-800"
            />
            {/*Botón de ojo para mostrar/ocultar contraseña*/}
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/*FORGOT PASSWORD*/}
        <Animated.View entering={FadeInDown.delay(380).duration(350)} className="self-end mb-5">
          <TouchableOpacity onPress={() => router.push("/forgot-password" as any)}>
            <Text
              className="text-base text-[#0d1b2e]"
              style={{ textDecorationLine: "underline" }}
            >
              {t('login.forgot_password')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* BOTON: Log in */}
        <Animated.View entering={FadeInDown.delay(440).duration(350)}>
          <TouchableOpacity
            testID="sign_in_confirmation"
            onPress={signInWithEmail}
            disabled={loading || googleLoading}
            className={`rounded-full py-4 items-center mb-3 ${loading ? "opacity-50" : ""}`}
            style={{ backgroundColor: "#0d1b2e" }}
          >
            <Text className="text-white text-2xl font-bold">
              {loading ? "Signing in..." : "Log in"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* SEPARADOR */}
        <View className="h-px bg-gray-300 mb-3" />

        {/*BOTON: Register*/}
        <Animated.View entering={FadeInDown.delay(500).duration(350)}>
          <TouchableOpacity
            testID="sign_up_redirect"
            onPress={() => {
              posthog.capture("sign_up_redirect_tapped");
              router.push("/register" as any);
            }}
            className="rounded-full py-4 items-center mb-3"
            style={{ backgroundColor: "#c8e6f7" }}
          >
            <Text className="text-[#0d1b2e] text-2xl font-bold">Register</Text>
          </TouchableOpacity>
        </Animated.View>

        {/*BOTON: Continue with Google*/}
        <Animated.View entering={FadeInDown.delay(560).duration(350)}>
          <TouchableOpacity
            testID="google_sign_in_button"
            onPress={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className={`rounded-full py-4 items-center flex-row justify-center border border-gray-200 ${googleLoading ? "opacity-50" : ""}`}
            style={{ backgroundColor: "#e8f4fb" }}
          >
            <GoogleIcon size={36} />
            <Text className="text-[#0d1b2e] text-2xl font-bold ml-3">
              {googleLoading ? "Connecting..." : "Continue with Google"}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

