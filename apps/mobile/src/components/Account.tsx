import { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { supabase } from "../lib/supabase";
import Avatar from "./Avatar";
import { usePostHog } from "../lib/posthog";

export default function Account({
  userId,
  email,
}: {
  userId: string;
  email?: string;
}) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const router = useRouter();
  const posthog = usePostHog();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  useEffect(() => {
    if (userId) getProfile();
  }, [userId]);

  async function getProfile() {
    try {
      setLoading(true);

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, website, avatar_url`)
        .eq("id", userId)
        .single();
      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setWebsite(data.website);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile({
    username,
    website,
    avatar_url,
  }: {
    username: string;
    website: string;
    avatar_url: string;
  }) {
    try {
      setLoading(true);

      const updates = {
        id: userId,
        username,
        website,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("profiles").upsert(updates);

      if (error) {
        throw error;
      }
      posthog.capture("profile_updated", {
        has_username: !!username,
        has_website: !!website,
      });
    } catch (error: any) {
      Alert.alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="mt-4 sm:mt-8 p-1 sm:p-3">
      <View>
        <Avatar
          size={isMobile ? 140 : 200}
          url={avatarUrl}
          onUpload={(url: string) => {
            setAvatarUrl(url);
            updateProfile({ username, website, avatar_url: url });
          }}
        />
      </View>
      <View className="py-1 self-stretch mt-4">
        <Text className="text-sm sm:text-base font-semibold text-[#86939e] mb-1.5">{t("account.emailLabel")}</Text>
        <TextInput
          testID="account_email_field"
          value={email ?? ""}
          editable={false}
          selectTextOnFocus={false}
          className="border border-[#d1d1d1] rounded-xl p-3 text-sm sm:text-base bg-[#f2f2f2] text-[#9e9e9e]"
        />
      </View>
      <View className="py-1 self-stretch">
        <Text className="text-sm sm:text-base font-semibold text-[#86939e] mb-1.5">{t("account.usernameLabel")}</Text>
        <TextInput
          testID="account_username_field"
          value={username || ""}
          onChangeText={(text) => setUsername(text)}
          className="border border-[#86939e] rounded-xl p-3 text-sm sm:text-base"
        />
      </View>
      <View className="py-1 self-stretch">
        <Text className="text-sm sm:text-base font-semibold text-[#86939e] mb-1.5">{t("account.websiteLabel")}</Text>
        <TextInput
          testID="account_website_field"
          value={website || ""}
          onChangeText={(text) => setWebsite(text)}
          className="border border-[#86939e] rounded-xl p-3 text-sm sm:text-base"
        />
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity
          testID="account_update_button"
          className={`bg-[#2089dc] rounded-xl p-3.5 items-center ${loading ? "opacity-50" : ""}`}
          onPress={() =>
            updateProfile({ username, website, avatar_url: avatarUrl })
          }
          disabled={loading}
        >
          <Text className="text-white text-base font-semibold">
            {loading ? t("account.loading") : t("account.updateButton")}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-3">
        <TouchableOpacity
          testID="account_signout_button"
          className="bg-[#0d1b2e] rounded-xl p-3.5 items-center"
          onPress={() => {
              posthog.capture("user_signed_out");
              posthog.reset();
              supabase.auth.signOut();
            }}
        >
          <Text className="text-white text-base font-semibold">{t("account.signOutButton")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}


