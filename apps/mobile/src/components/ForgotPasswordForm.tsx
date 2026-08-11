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
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import { usePostHog } from "../lib/posthog";
import * as Linking from "expo-linking";

export default function ForgotPasswordForm() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const router  = useRouter();
  const posthog = usePostHog();

  async function handleResetPassword() {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: Linking.createURL("/reset-password"),
    });
    if (error) {
      Alert.alert("Error", error.message);
      posthog.capture("forgot_password_failed", { error_message: error.message });
    } else {
      posthog.capture("forgot_password_sent", { email });
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center px-6">

      {/*LOGO CRA*/}
      <Animated.View
        entering={FadeInDown.duration(500).springify()}
        style={{
          width: 210,
          height: 210,
          marginBottom: -85,
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
          maxWidth: 860,
          backgroundColor: "rgba(255,255,255,0.5)",
          borderRadius: 52,
          paddingTop: 125,
          paddingBottom: 60,
          paddingHorizontal: 60,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 13 },
          shadowOpacity: 0.12,
          shadowRadius: 38,
          elevation: 10,
        }}
      >
        {/*Estado: confirmación de email enviado*/}
        {sent ? (
          <Animated.View key="sent" entering={FadeInDown.duration(400)}>
            <View className="items-center">
              <Animated.View entering={FadeInDown.delay(80).duration(350).springify()}>
                <Text className="text-7xl mb-5">📬</Text>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(140).duration(350)}>
                <Text className="text-4xl font-black text-[#0d1b2e] text-center mb-3">
                  Check your inbox
                </Text>
              </Animated.View>
              <Animated.View entering={FadeInDown.delay(200).duration(350)}>
                <Text className="text-2xl text-gray-500 text-center leading-8 mb-8">
                  We sent a password reset link to{"\n"}
                  <Text className="font-semibold text-[#0d1b2e]">{email}</Text>
                </Text>
              </Animated.View>

              {/*BOTON: Volver al login*/}
              <Animated.View entering={FadeInDown.delay(260).duration(350)}>
                <View className="w-full mb-4">
                  <TouchableOpacity
                    onPress={() => router.push("/login" as any)}
                    className="rounded-full px-10 py-6 items-center w-full"
                    style={{ backgroundColor: "#0d1b2e" }}
                  >
                    <Text className="text-white text-2xl font-bold">Back to Log in</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>

              {/*SEPARADOR*/}
              <View className="h-px bg-gray-300 w-full mb-4" />

              {/*Reenviar link*/}
              <Animated.View entering={FadeInDown.delay(320).duration(350)}>
                <View className="w-full">
                  <TouchableOpacity
                    onPress={() => setSent(false)}
                    className="rounded-full px-10 py-6 items-center w-full"
                    style={{ backgroundColor: "#c8e6f7" }}
                  >
                    <Text className="text-[#0d1b2e] text-2xl font-bold">
                      Didn't receive it? Try again
                    </Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
          </Animated.View>

        ) : (
          <Animated.View key="form" entering={FadeInDown.duration(400)}>
            {/*TITULO*/}
            <Animated.View entering={FadeInDown.delay(80).duration(350)}>
              <Text className="text-4xl font-black text-[#0d1b2e] text-center mb-2">
                Forgot password?
              </Text>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(140).duration(350)}>
              <Text className="text-xl text-gray-500 text-center mb-8 leading-7">
                Enter your email and we'll send you a link to reset your password.
              </Text>
            </Animated.View>

            {/*CAMPO: Email*/}
            <Animated.View entering={FadeInDown.delay(200).duration(350)}>
              <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-8 py-6 mb-6 border border-gray-200">
                <Text className="text-gray-400 text-3xl mr-4">✉️</Text>
                <TextInput
                  testID="forgot_password_email_field"
                  onChangeText={setEmail}
                  value={email}
                  placeholder="Email"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  placeholderTextColor="#9ca3af"
                  className="flex-1 text-2xl text-gray-800"
                />
              </View>
            </Animated.View>

            {/*BOTON: Send reset link*/}
            <Animated.View entering={FadeInDown.delay(260).duration(350)}>
              <TouchableOpacity
                testID="forgot_password_submit"
                onPress={handleResetPassword}
                disabled={loading}
                className={`rounded-full py-6 items-center mb-4 ${loading ? "opacity-50" : ""}`}
                style={{ backgroundColor: "#0d1b2e" }}
              >
                <Text className="text-white text-2xl font-bold">
                  {loading ? "Sending..." : "Send reset link"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/*SEPARADOR*/}
            <View className="h-px bg-gray-300 mb-4" />

            {/*BOTON: Back to Log in*/}
            <Animated.View entering={FadeInDown.delay(320).duration(350)}>
              <TouchableOpacity
                onPress={() => router.push("/login" as any)}
                className="rounded-full py-6 items-center"
                style={{ backgroundColor: "#c8e6f7" }}
              >
                <Text className="text-[#0d1b2e] text-2xl font-bold">Back to Log in</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </Animated.View>
    </View>
  );
}
