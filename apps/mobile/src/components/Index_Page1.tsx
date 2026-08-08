import React from "react";
import { Text, View } from "react-native";
import { BlurView } from "expo-blur";

export default function Index_Page1() {

    return (
        <View style={{ position: "relative", alignItems: "center", justifyContent: "center", top: 40}}>

                <View className="flex flex-col gap-4 mb-8">
                    
                    <Text className="text-6xl font-semibold text-[#051b32] text-center mb-2">
                        Features
                    </Text>
                    

                </View>
            <BlurView
                intensity={50}
                tint="light"
                className="w-3/4 h-3/4 flex-row justify-between p-6 bg-white rounded-2xl gap-4"
                style={{ overflow: "hidden" }}
            >
                            
                <View className="flex-1 flex-col gap-4 bg-white rounded-2xl p-6">
                    <Text>y si te invito una copaaaaa y me acerco a tu bocaaa</Text>
                </View>
                
                <View className="flex-1 flex-col gap-4 bg-white rounded-2xl p-6">
                    <Text>sabes es chistoso que estos textos no saldran asi que</Text>
                </View>

                <View className="flex-1 flex-col gap-4 bg-white rounded-2xl p-6">
                    <Text>que viva las chivas y asi dos puntos uve</Text>
                </View>

            </BlurView>
        </View>
    );
}