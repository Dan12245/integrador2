import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

export const CATEGORY_OPTIONS = ["Error", "Suggestion", "Other"] as const;
export type CategoryOption = (typeof CATEGORY_OPTIONS)[number];

export default function FeedbackForm() {
  const [category, setCategory] = useState<CategoryOption>("Error");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) {
      Alert.alert("Validation Error", "Please provide a description for your feedback.");
      return;
    }

    try {
      setLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        Alert.alert("Authentication Error", "You must be logged in to submit feedback.");
        return;
      }

      const { error } = await supabase.from("feedback").insert([
        {
          profile_id: session.user.id,
          category: category,
          description: description.trim(),
          status: "open",
        },
      ]);

      if (error) {
        throw error;
      }

      Alert.alert("Thank You!", "Your feedback has been submitted successfully.");
      setDescription("");
      setCategory("Error");
    } catch (err: any) {
      Alert.alert("Submission Failed", err?.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mt-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">Submit Feedback</Text>

      {/* Category Combobox Field */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-700 mb-1.5">Category</Text>

        <Pressable
          testID="feedback-category-combobox"
          onPress={() => setDropdownVisible(!dropdownVisible)}
          className="flex-row items-center justify-between border border-gray-300 rounded-xl px-4 py-3 bg-gray-50 active:bg-gray-100"
        >
          <Text className="text-gray-900 font-medium text-base">{category}</Text>
          <Feather
            name={dropdownVisible ? "chevron-up" : "chevron-down"}
            size={20}
            color="#4B5563"
          />
        </Pressable>

        {/* Modal Dropdown for Combobox selection */}
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <Pressable
            className="flex-1 bg-black/40 justify-center items-center p-4"
            onPress={() => setDropdownVisible(false)}
          >
            <View className="bg-white w-full max-w-sm rounded-2xl p-4 shadow-xl border border-gray-100">
              <Text className="text-lg font-bold text-gray-800 mb-3 text-center">
                Select Category
              </Text>
              {CATEGORY_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  testID={`feedback-category-option-${opt.toLowerCase()}`}
                  onPress={() => {
                    setCategory(opt);
                    setDropdownVisible(false);
                  }}
                  className={`flex-row items-center justify-between p-3.5 rounded-xl mb-1.5 ${
                    category === opt ? "bg-sky-50 border border-sky-200" : "bg-gray-50"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      category === opt ? "text-sky-700" : "text-gray-700"
                    }`}
                  >
                    {opt}
                  </Text>
                  {category === opt && <Feather name="check" size={18} color="#0369a1" />}
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Modal>
      </View>

      {/* Description Field */}
      <View className="mb-5">
        <Text className="text-sm font-semibold text-gray-700 mb-1.5">Description</Text>
        <TextInput
          testID="feedback-description-input"
          value={description}
          onChangeText={setDescription}
          placeholder="Describe your issue, bug, suggestion, or comment here..."
          placeholderTextColor="#9CA3AF"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          className="border border-gray-300 rounded-xl p-3.5 text-base bg-white min-h-[110px] text-gray-800"
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        testID="feedback-submit-button"
        onPress={handleSubmit}
        disabled={loading}
        className={`bg-[#2089dc] rounded-xl p-4 items-center justify-center flex-row ${
          loading ? "opacity-60" : "active:opacity-90"
        }`}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <>
            <Feather name="send" size={18} color="#ffffff" style={{ marginRight: 8 }} />
            <Text className="text-white text-base font-bold">Submit Feedback</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
