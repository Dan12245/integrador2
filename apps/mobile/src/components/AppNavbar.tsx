import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";

export default function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();

  const isActive = (path: string) => pathname === path;
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };
  
  const currentLang = i18n.language || 'es';

  return (
    <View className="flex-row items-center justify-between bg-[#0d1b2e] px-6 h-14">

      {/* Logo */}
      <TouchableOpacity onPress={() => router.push("/home" as any)} className="flex-row items-center">
        <Image
          source={require("../assets/images/splash-icon.png")}
          style={{ width: 36, height: 36 }}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Nav links */}
      <View className="flex-row items-center gap-2">
        <TouchableOpacity onPress={() => router.push("/home" as any)}>
          <Text className={`text-sm ${isActive("/home") ? "text-white font-semibold" : "text-white/70"}`}>
            {t('nav.home')}
          </Text>
        </TouchableOpacity>

        <Text className="text-white/30 mx-1">|</Text>

        <TouchableOpacity onPress={() => router.push("/consumptions" as any)}>
          <Text className={`text-sm ${isActive("/consumptions") ? "text-white font-semibold" : "text-white/70"}`}>
            {t('nav.consumptions')}
          </Text>
        </TouchableOpacity>

        <Text className="text-white/30 mx-1">|</Text>

        <TouchableOpacity onPress={() => router.push("/myBuildings" as any)}>
          <Text className={`text-sm ${isActive("/myBuildings") ? "text-white font-semibold" : "text-white/70"}`}>
            {t('nav.myBuildings')}
          </Text>
        </TouchableOpacity>

        <Text className="text-white/30 mx-1">|</Text>

        <TouchableOpacity onPress={() => router.push("/techSupport" as any)}>
          <Text className={`text-sm ${isActive("/techSupport") ? "text-white font-semibold" : "text-white/70"}`}>
            {t('nav.help')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Right side: lang + avatar */}
      <View className="flex-row items-center gap-4">
        {/* Language toggle */}
        <View className="flex-row items-center gap-1">
          <TouchableOpacity onPress={() => changeLanguage('en')}>
            <Text className={`text-xs ${currentLang.startsWith('en') ? 'text-white font-semibold' : 'text-white/50'}`}>EN</Text>
          </TouchableOpacity>
          <Text className="text-white/40 text-xs">|</Text>
          <TouchableOpacity onPress={() => changeLanguage('es')}>
            <Text className={`text-xs ${currentLang.startsWith('es') ? 'text-white font-semibold' : 'text-white/50'}`}>ES</Text>
          </TouchableOpacity>
        </View>

        {/* Avatar / User profile */}
        <TouchableOpacity onPress={() => router.push("/userProfile" as any)}>
          <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center overflow-hidden">
            <Text className="text-white text-xs font-bold">U</Text>
          </View>
        </TouchableOpacity>
      </View>

    </View>
  );
}
