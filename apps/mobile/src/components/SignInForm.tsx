import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert("Error", error.message);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center p-6 bg-white">
      <View className="mb-8">
        <Text className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
          Welcome to CRA
        </Text>
        <Text className="text-gray-500">
          Sign in to manage your account and profile
        </Text>
      </View>

      <View className="flex flex-col gap-4 mb-8">
        <View>
          <Text className="text-sm font-semibold text-gray-700 mb-2">Email Address</Text>
          <TextInput
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
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="••••••••"
            autoCapitalize="none"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-base text-gray-900 bg-gray-50 focus:border-indigo-600 focus:bg-white"
          />
        </View>
      </View>

      <View className="flex flex-col gap-4">
        <TouchableOpacity
          className={`w-full bg-indigo-600 py-4 rounded-xl items-center justify-center shadow-lg shadow-indigo-600/30 ${loading ? 'opacity-50' : ''}`}
          onPress={signInWithEmail}
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? "Signing in..." : "Sign In"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/register" as any)}
          className="w-full py-2 items-center"
        >
          <Text className="text-indigo-600 font-medium">
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
