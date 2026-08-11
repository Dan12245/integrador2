import React, { useState } from "react";
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { Image } from "expo-image";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";

export default function ResetPasswordForm() {
  const [password, setPassword]               = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading]                 = useState(false);
  const router = useRouter();

  async function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      await supabase.auth.signOut();
      Alert.alert("Success", "Your password has been updated successfully! Please log in.");
      router.replace("/login" as any);
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
          contentFit="contain"
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
        <Animated.View key="form" entering={FadeInDown.duration(400)}>
          {/*TITULO*/}
          <Animated.View entering={FadeInDown.delay(80).duration(350)}>
            <Text className="text-4xl font-black text-[#0d1b2e] text-center mb-2">
              New Password
            </Text>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(140).duration(350)}>
            <Text className="text-xl text-gray-500 text-center mb-8 leading-7">
              Enter your new password below.
            </Text>
          </Animated.View>

          {/*CAMPO: Password*/}
          <Animated.View entering={FadeInDown.delay(200).duration(350)}>
            <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-8 py-6 mb-4 border border-gray-200">
              <Text className="text-gray-400 text-3xl mr-4">🔒</Text>
              <TextInput
                onChangeText={setPassword}
                value={password}
                placeholder="New Password"
                secureTextEntry
                placeholderTextColor="#9ca3af"
                className="flex-1 text-2xl text-gray-800"
              />
            </View>
          </Animated.View>

          {/*CAMPO: Confirm Password*/}
          <Animated.View entering={FadeInDown.delay(260).duration(350)}>
            <View className="flex-row items-center bg-[#f0f4f8] rounded-full px-8 py-6 mb-6 border border-gray-200">
              <Text className="text-gray-400 text-3xl mr-4">🔒</Text>
              <TextInput
                onChangeText={setConfirmPassword}
                value={confirmPassword}
                placeholder="Confirm Password"
                secureTextEntry
                placeholderTextColor="#9ca3af"
                className="flex-1 text-2xl text-gray-800"
              />
            </View>
          </Animated.View>

          {/*BOTON: Update password*/}
          <Animated.View entering={FadeInDown.delay(320).duration(350)}>
            <TouchableOpacity
              onPress={handleUpdatePassword}
              disabled={loading}
              className={`rounded-full py-6 items-center mb-4 ${loading ? "opacity-50" : ""}`}
              style={{ backgroundColor: "#0d1b2e" }}
            >
              <Text className="text-white text-2xl font-bold">
                {loading ? "Updating..." : "Update Password"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
