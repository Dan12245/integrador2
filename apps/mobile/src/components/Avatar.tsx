import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { View, Alert, Image, Text, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { usePostHog } from "../lib/posthog";
import { useTranslation } from "react-i18next";

interface Props {
  size: number;
  url: string | null;
  onUpload?: (filePath: string) => void;
  showUpload?: boolean;
  shape?: "square" | "circle";
  fallbackText?: string;
}

export default function Avatar({
  url,
  size = 150,
  onUpload,
  showUpload = true,
  shape = "square",
  fallbackText,
}: Props) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const avatarSize = { height: size, width: size };
  const posthog = usePostHog();

  useEffect(() => {
    if (url) downloadImage(url);
  }, [url]);

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage.from("avatars").download(path);

      if (error) {
        throw error;
      }

      const fr = new FileReader();
      fr.readAsDataURL(data);
      fr.onload = () => {
        setAvatarUrl(fr.result as string);
      };
    } catch (error: any) {
      console.log("Error downloading image: ", error.message);
    }
  }

  async function uploadAvatar() {
    if (!onUpload) return;
    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        allowsEditing: true,
        quality: 1,
        exif: false,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("User cancelled image picker.");
        return;
      }

      const image = result.assets[0];
      console.log("Got image", image);

      if (!image.uri) {
        throw new Error("No image uri!");
      }

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split(".").pop()?.toLowerCase() ?? "jpeg";
      const path = `${Date.now()}.${fileExt}`;
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, arraybuffer, {
          contentType: image.mimeType ?? "image/jpeg",
        });

      if (uploadError) {
        throw uploadError;
      }

      posthog.capture("avatar_uploaded", { file_extension: fileExt });
      onUpload(data.path);
    } catch (error: any) {
      if (error) {
        Alert.alert(error.message);
      } else {
        throw error;
      }
    } finally {
      setUploading(false);
    }
  }

  const isCircle = shape === "circle";
  const roundedClass = isCircle ? "rounded-full" : "rounded-[8px]";

  return (
    <View className="items-center justify-center">
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          accessibilityLabel="Avatar"
          style={avatarSize}
          className={`${roundedClass} overflow-hidden max-w-full object-cover`}
        />
      ) : (
        <View
          style={avatarSize}
          className={`${roundedClass} overflow-hidden max-w-full bg-[#2089dc] items-center justify-center border border-white/20`}
        >
          {fallbackText ? (
            <Text className="text-white text-xs font-bold">{fallbackText}</Text>
          ) : null}
        </View>
      )}
      {showUpload && onUpload && (
        <View className="mt-3">
          <TouchableOpacity
            testID="avatar_upload_button"
            className={`bg-[#2089dc] rounded-xl px-4 py-2.5 items-center ${uploading ? "opacity-50" : ""}`}
            onPress={uploadAvatar}
            disabled={uploading}
          >
            <Text className="text-white text-sm font-semibold">
              {uploading ? t("account.uploading") : t("account.upload")}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

