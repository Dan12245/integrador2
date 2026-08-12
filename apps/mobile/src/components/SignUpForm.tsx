import React, { useState } from "react";
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
import * as Linking from "expo-linking";
import { useTranslation } from "react-i18next";

export default function SignUpForm() {
  const { t } = useTranslation();
  const [email, setEmail]                     = useState("");
  const [username, setUsername]               = useState("");
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const [googleLoading, setGoogleLoading]     = useState(false);
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const router  = useRouter();
  const posthog = usePostHog();

  async function signUpWithEmail() {
    if (!email || !password || !username) {
      Alert.alert(t('signup.error_title'), t('signup.error_fill_fields'));
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(t('signup.error_title'), t('signup.error_password_mismatch'));
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: Linking.createURL("/"),
      }
    });
    if (error) {
      Alert.alert(t('signup.error_title'), error.message);
      posthog.capture("registration_failed", { error_message: error.message });
    } else {
      posthog.identify(email, {
        $set: { email },
        $set_once: { registration_date: new Date().toISOString() },
      });
      posthog.capture("user_registered");
      Alert.alert(t('signup.success_title'), t('signup.success_message'));
      router.push("/login" as any);
    }
    setLoading(false);
  }

  async function handleGoogleSignUp() {
    setGoogleLoading(true);
    posthog.capture("google_sign_up_initiated");
    try {
      const sessionData = await performGoogleSignIn();
      if (sessionData?.user?.email) {
        posthog.identify(sessionData.user.email, {
          $set: { email: sessionData.user.email },
          $set_once: { registration_date: new Date().toISOString() },
        });
      }
      posthog.capture("user_registered_google");
      if (sessionData?.session) {
        router.replace("/home" as any);
      }
    } catch (error: any) {
      if (error?.message && !error.message.includes("cancel")) {
        Alert.alert(t('signup.google_error_title'), error.message);
      }
      posthog.capture("google_sign_up_failed", { error_message: error?.message });
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
          width: 160,
          height: 160,
          marginBottom: -65,
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
          borderRadius: 40,
          paddingTop: 95,
          paddingBottom: 46,
          paddingHorizontal: 46,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 28,
          elevation: 10,
        }}
      >
        {/*CAMPO: Email*/}
        <Animated.View entering={FadeInDown.delay(250).duration(350)}>
          <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-6 py-4 mb-4 border border-gray-200">
            {/*Icono de sobre a la izquierda*/}
            <Feather name="mail" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              testID="signup_email_field"
              onChangeText={setEmail}
              value={email}
              placeholder={t('signup.email_placeholder')}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholderTextColor="#9ca3af"
              // flex-1 hace que el input ocupe el espacio restante,
              // empujando cualquier ícono derecho (como el ícono del ojo) al borde
              className="flex-1 text-lg text-gray-800"
            />
          </View>
        </Animated.View>

        {/*CAMPO: Username*/}
        <Animated.View entering={FadeInDown.delay(310).duration(350)}>
          <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-6 py-4 mb-4 border border-gray-200">
            <Feather name="user" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              testID="signup_username_field"
              onChangeText={setUsername}
              value={username}
              placeholder={t('signup.username_placeholder')}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-lg text-gray-800"
            />
          </View>
        </Animated.View>

        {/*CAMPO: Password con ojo*/}
        <Animated.View entering={FadeInDown.delay(370).duration(350)}>
          <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-6 py-4 mb-4 border border-gray-200">
            <Feather name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              testID="signup_password_field"
              onChangeText={setPassword}
              value={password}
              secureTextEntry={!showPassword}
              placeholder={t('signup.password_placeholder')}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-lg text-gray-800"
            />
            {/*Botón de ojo*/}
            <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/*CAMPO: Confirm Password con ojo*/}
        <Animated.View entering={FadeInDown.delay(430).duration(350)}>
          <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-6 py-4 mb-6 border border-gray-200">
            <Feather name="lock" size={20} color="#9ca3af" style={{ marginRight: 12 }} />
            <TextInput
              testID="signup_confirm_password_field"
              onChangeText={setConfirmPassword}
              value={confirmPassword}
              secureTextEntry={!showConfirm}
              placeholder={t('signup.confirm_password_placeholder')}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
              className="flex-1 text-lg text-gray-800"
            />
            <TouchableOpacity onPress={() => setShowConfirm(prev => !prev)}>
              <Feather name={showConfirm ? "eye-off" : "eye"} size={18} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/*BOTON: Register*/}
        <Animated.View entering={FadeInDown.delay(490).duration(350)}>
          <TouchableOpacity
            testID="signup_submit_button"
            onPress={signUpWithEmail}
            disabled={loading || googleLoading}
            className={`rounded-full py-4 items-center mb-3 ${loading ? "opacity-50" : ""}`}
            style={{ backgroundColor: "#0d1b2e" }}
          >
            <Text className="text-white text-lg font-bold">
              {loading ? t('signup.creating_account') : t('signup.register_button')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/*BOTON: Continue with Google*/}
        <Animated.View entering={FadeInDown.delay(550).duration(350)}>
          <TouchableOpacity
            testID="google_sign_up_button"
            onPress={handleGoogleSignUp}
            disabled={loading || googleLoading}
            className={`rounded-full py-4 items-center flex-row justify-center mb-4 ${googleLoading ? "opacity-50" : ""}`}
            style={{ backgroundColor: "#c8e6f7" }}
          >
            <GoogleIcon size={26} />
            <Text className="text-[#0d1b2e] text-lg font-bold ml-2">
              {googleLoading ? t('signup.connecting') : t('signup.continue_with_google')}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/*LINK: I already have an account*/}
        <Animated.View entering={FadeInDown.delay(610).duration(350)}>
          <TouchableOpacity
            testID="signin_redirect_button"
            onPress={() => {
              posthog.capture("sign_in_redirect_tapped");
              router.push("/login" as any);
            }}
            className="items-center"
          >
            <Text
              className="text-base text-[#0d1b2e]"
              style={{ textDecorationLine: "underline" }}
            >
              {t('signup.already_have_account')}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
