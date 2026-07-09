import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { appStyles } from "../../styles/styles";
import ReceiptScannerButton from "../../components/Camera";

export default function MyBuildings() {
  const router = useRouter();

  return (
    <View style={appStyles.container}>
      <View style={[appStyles.verticallySpaced, { alignItems: "center", marginBottom: 20 }]}>
        <Text style={{ fontSize: 24, fontWeight: "bold", color: "#333" }}>myBuildings</Text>
      </View>

      <View style={{ marginBottom: 20 }}>
        <ReceiptScannerButton 
          onDataExtracted={(data) => console.log(data)}
          onError={(error) => console.error(error)}
        />
      </View>

      <View style={appStyles.verticallySpaced}>
        <TouchableOpacity
          style={appStyles.button}
          onPress={() => router.push("/userProfile" as any)}
        >
          <Text style={appStyles.buttonText}>Go to User Profile</Text>
        </TouchableOpacity>
      </View>

      <View style={appStyles.verticallySpaced}>
        <TouchableOpacity
          style={appStyles.button}
          onPress={() => router.push("/techSupport" as any)}
        >
          <Text style={appStyles.buttonText}>Go to Tech Support</Text>
        </TouchableOpacity>
      </View>

      <View style={appStyles.verticallySpaced}>
        <TouchableOpacity
          style={appStyles.button}
          onPress={() => router.push("/consumptions" as any)}
        >
          <Text style={appStyles.buttonText}>Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View style={[appStyles.verticallySpaced, appStyles.mt20]}>
        <TouchableOpacity
          style={[appStyles.button, { backgroundColor: "#86939e" }]}
          onPress={() => router.push("/home" as any)}
        >
          <Text style={appStyles.buttonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
