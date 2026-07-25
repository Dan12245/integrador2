import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { usePostHog } from "../lib/posthog";
import { performGoogleSignIn } from "../lib/auth";
import GoogleIcon from "./GoogleIcon";

export default function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const router = useRouter();
  const posthog = usePostHog();

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
      posthog.capture("registration_failed", { error_message: error.message });
    } else {
      posthog.identify(email, {
        $set: { email },
        $set_once: { registration_date: new Date().toISOString() },
      });
      posthog.capture("user_registered");
      Alert.alert("Success", "Check your inbox for email verification!");
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
    } catch (error: any) {
      if (error?.message && !error.message.includes("cancel")) {
        Alert.alert("Google Sign-Up Error", error.message);
      }
      posthog.capture("google_sign_up_failed", { error_message: error?.message });
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Create Account
        </Text>
        <Text className="text-gray-500">
          Sign up to get started
        </Text>
      </View>

      <TouchableOpacity
        testID="google_sign_up_button"
        className={`w-full flex-row items-center justify-center bg-white border border-gray-300 py-3.5 px-4 rounded-xl mb-6 shadow-sm active:bg-gray-50 ${googleLoading ? 'opacity-50' : ''}`}
        onPress={handleGoogleSignUp}
        disabled={googleLoading || loading}
      >
        <GoogleIcon size={20} style={{ marginRight: 12 }} />
        <Text className="text-gray-800 text-base font-semibold">
          {googleLoading ? "Connecting to Google..." : "Sign Up with Google"}
        </Text>
      </TouchableOpacity>

      <View className="flex-row items-center mb-6">
        <View className="flex-1 h-px bg-gray-200" />
        <Text className="mx-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Or sign up with email
        </Text>
        <View className="flex-1 h-px bg-gray-200" />
      </View>

      <View className="flex flex-col gap-4 mb-8">
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
          <TextInput
            testID="signup_email_field"
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="you@example.com"
            autoCapitalize="none"
            keyboardType="email-address"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Password</Text>
          <TextInput
            testID="signup_password_field"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="••••••••"
            autoCapitalize="none"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
          />
        </View>

        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Confirm Password</Text>
          <TextInput
            testID="signup_confirm_password_field"
            onChangeText={(text) => setConfirmPassword(text)}
            value={confirmPassword}
            secureTextEntry={true}
            placeholder="••••••••"
            autoCapitalize="none"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
          />
        </View>
      </View>

      <View className="flex flex-col gap-4">
        <TouchableOpacity
          testID="signup_submit_button"
          className={`w-full bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 ${loading ? 'opacity-50' : ''}`}
          onPress={signUpWithEmail}
          disabled={loading || googleLoading}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Creating account..." : "Sign Up"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          testID="signin_redirect_button"
          onPress={() => {
            posthog.capture("sign_in_redirect_tapped");
            router.push("/login" as any);
          }}
          className="w-full py-2 items-center"
        >
          <Text className="text-indigo-600 font-medium">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

