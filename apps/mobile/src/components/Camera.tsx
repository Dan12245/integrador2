import React, { useState } from "react";
import {TouchableOpacity, Text, ActivityIndicator, Alert, Platform} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";

// Define default API URL based on Platform (local development)
const DEFAULT_API_URL = Platform.OS === "android" ? "http://10.0.2.2:8787" : "http://localhost:8787";

export interface ExtractedData {
  numero_contrato: string | null;
  clase_usuario: string | null;
  lectura_consumo: string | null;
  rawData?: string;
}

export interface ReceiptScannerButtonProps {
  onDataExtracted: (data: ExtractedData) => void;
  onError?: (error: string) => void;
  apiUrl?: string;
}

export default function ReceiptScannerButton({
  onDataExtracted,
  onError,
  apiUrl = DEFAULT_API_URL,
}: ReceiptScannerButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleScanReceipt = async () => {
    try {
      // 1. Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Camera access is required to take a picture of your water receipt."
        );
        return;
      }

      // 2. Launch native camera
      const pickerResult = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
        base64: true, // Required to get base64 string for Vision API
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        console.log("User cancelled camera scan.");
        return;
      }

      const capturedAsset = pickerResult.assets[0];
      const base64Image = capturedAsset.base64;

      if (!base64Image) {
        throw new Error("Failed to get image base64 data.");
      }

      // 3. Send photo to OCR API endpoint
      setIsProcessing(true);

      const response = await fetch(`${apiUrl}/scan-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: base64Image,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process image OCR.");
      }

      // 4. Return extracted fields
      if (result.success && result.extractedFields) {
        onDataExtracted({
          numero_contrato: result.extractedFields.numero_contrato,
          clase_usuario: result.extractedFields.clase_usuario,
          lectura_consumo: result.extractedFields.lectura_consumo,
          rawData: result.rawData,
        });
      } else {
        throw new Error("No data could be extracted from the receipt.");
      }

    } catch (error: any) {
      console.error("OCR Scanner Error:", error);
      const errorMessage = error.message || "An unknown error occurred.";
      
      if (onError) {
        onError(errorMessage);
      } else {
        Alert.alert("OCR Processing Error", errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleScanReceipt}
      disabled={isProcessing}
      className={`bg-blue-600 px-6 py-4 rounded-2xl flex-row justify-center items-center gap-2 shadow-md active:bg-blue-700 ${
        isProcessing ? "opacity-75" : ""
      }`}
    >
      {isProcessing ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Feather name="camera" size={18} color="#ffffff" />
      )}
      <Text className="text-white font-bold text-sm">
        {isProcessing ? "Processing Receipt..." : "Scan Water Receipt"}
      </Text>
    </TouchableOpacity>
  );
}
