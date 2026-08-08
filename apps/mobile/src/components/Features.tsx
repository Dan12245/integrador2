import React from "react";
import { Text, View } from "react-native";

export default function Features() {

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center", top: 40}}>

                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="text-6xl font-semibold text-[#051b32] text-center mb-2">
                        Features
                    </Text>
                    
                </View>

        </View>
    );
}