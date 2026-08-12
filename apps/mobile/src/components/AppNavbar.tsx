import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, useWindowDimensions } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useTranslation } from "react-i18next";
import { Feather } from "@expo/vector-icons";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import Avatar from "./Avatar";
import { supabase } from "../lib/supabase";

export default function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { width } = useWindowDimensions();
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const isMobile = width < 768;
  const isActive = (path: string) => pathname === path;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const currentLang = i18n.language || "es";

  useEffect(() => {
    supabase.auth.getSession().then((res) => {
      const user = res.data.session?.user;
      if (user) {
        supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single()
          .then(({ data }) => {
            if (data?.avatar_url) {
              setAvatarUrl(data.avatar_url);
            }
          });
      }
    });
  }, []);

  const navigateTo = (path: string) => {
    setMenuOpen(false);
    router.push(path as any);
  };

  const navItems = [
    { label: t("nav.home"), path: "/home", icon: "home" as const },
    { label: t("nav.consumptions"), path: "/consumptions", icon: "bar-chart-2" as const },
    { label: t("nav.myBuildings"), path: "/myBuildings", icon: "grid" as const },
    { label: t("nav.help"), path: "/techSupport", icon: "help-circle" as const },
  ];

  return (
    <View className="bg-[#0d1b2e] z-50">
      <View className="flex-row items-center justify-between px-4 sm:px-6 h-16">

        {/* Logo */}
        <TouchableOpacity onPress={() => navigateTo("/home")} className="flex-row items-center">
          <Image
            source={require("../assets/images/splash-icon.png")}
            style={{ width: 36, height: 36 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        {/* Desktop Nav links */}
        {!isMobile && (
          <View className="flex-row items-center gap-2">
            {navItems.map((item, idx) => (
              <React.Fragment key={item.path}>
                {idx > 0 && <Text className="text-white/30 mx-1">|</Text>}
                <TouchableOpacity onPress={() => navigateTo(item.path)}>
                  <Text className={`text-sm ${isActive(item.path) ? "text-white font-semibold" : "text-white/70"}`}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        )}

        {/* Right side: lang + avatar + mobile toggle */}
        <View className="flex-row items-center gap-2.5">
          {/* Language toggle */}
          <View className="flex-row items-center gap-1 bg-white/10 px-2 py-1 rounded-full">
            <TouchableOpacity onPress={() => changeLanguage("en")}>
              <Text className={`text-xs ${currentLang.startsWith("en") ? "text-white font-semibold" : "text-white/50"}`}>
                EN
              </Text>
            </TouchableOpacity>
            <Text className="text-white/40 text-xs">|</Text>
            <TouchableOpacity onPress={() => changeLanguage("es")}>
              <Text className={`text-xs ${currentLang.startsWith("es") ? "text-white font-semibold" : "text-white/50"}`}>
                ES
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar / User profile */}
          <TouchableOpacity onPress={() => navigateTo("/userProfile")}>
            <Avatar
              url={avatarUrl}
              size={34}
              shape="circle"
              showUpload={false}
              fallbackText="U"
            />
          </TouchableOpacity>

          {/* Mobile Hamburger Button */}
          {isMobile && (
            <TouchableOpacity
              onPress={() => setMenuOpen((prev) => !prev)}
              className="p-1.5 rounded-lg bg-white/10 ml-0.5"
              activeOpacity={0.7}
            >
              <Feather name={menuOpen ? "x" : "menu"} size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

      </View>

      {/* Mobile Dropdown Menu */}
      {isMobile && menuOpen && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOutUp.duration(150)}
          className="bg-[#0b1626] border-t border-white/10 px-5 py-3 shadow-xl"
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <TouchableOpacity
                key={item.path}
                onPress={() => navigateTo(item.path)}
                className={`flex-row items-center px-4 py-3 rounded-xl mb-1.5 ${
                  active ? "bg-blue-600/20 border border-blue-500/30" : "bg-white/5"
                }`}
              >
                <Feather
                  name={item.icon}
                  size={18}
                  color={active ? "#60a5fa" : "#9ca3af"}
                  style={{ marginRight: 12 }}
                />
                <Text
                  className={`text-base flex-1 ${
                    active ? "text-white font-semibold" : "text-white/80"
                  }`}
                >
                  {item.label}
                </Text>
                {active && <View className="w-2 h-2 rounded-full bg-blue-400" />}
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}
