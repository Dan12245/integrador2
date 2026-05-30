import React from "react";
import { Button, Text, View } from "react-native";
import Animated, { useSharedValue, withSpring } from "react-native-reanimated";

const index = () => {
  const width = useSharedValue(100);

  const hanflePress = () => {
    width.value = withSpring(Math.random() * 200 + 50);
  };

  return (
    <View className="flex-1 items-center justify-center bg-gray-900">
      <Animated.View
        style={{
          width,
          height: 100,
          backgroundColor: "blue",
        }}
      />
      <Button onPress={hanflePress} title="Change Width" />
      <Text className="text-xl font-bold text-green-500">
        Welcome to Caldo de Rata!
      </Text>
    </View>
  );
};

export default index;
