import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { getApiUrl } from "@/src/lib/api";

export interface ExtractedData {
    contract_number: string | null;
    user_type: string | null;
    consumption_reading: string | null;
    service_date?: string | null;
    name?: string | null;
    address?: string | null;
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
    apiUrl = getApiUrl(),
}: ReceiptScannerButtonProps) {
    const { t } = useTranslation();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleScanReceipt = async () => {
        try {
            // 1. Request camera permissions
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert(
                    t("camera.permissionRequiredTitle"),
                    t("camera.permissionRequiredMessage"),
                );
                return;
            }

            // 2. Launch native camera
            const pickerResult = await ImagePicker.launchCameraAsync({
                mediaTypes: ["images"],
                allowsEditing: true,
                quality: 0.5,
                base64: true, // Required to get base64 string for Vision API
                exif: false,
            });

            if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
                console.log("User cancelled camera scan.");
                return;
            }

            const capturedAsset = pickerResult.assets[0];
            const base64Image = capturedAsset.base64;

            if (!base64Image) {
                throw new Error(t("camera.base64Error"));
            }

            // 3. Send photo to OCR API endpoint
            setIsProcessing(true);

            const targetUrl = `${apiUrl}/scan-receipt`;
            const payload = JSON.stringify({ imageBase64: base64Image });
            console.log(`[OCR] Sending ${(payload.length / 1024).toFixed(0)}KB to ${targetUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

            const response = await fetch(targetUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: payload,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = result.details
                    ? `${result.error} - ${result.details}`
                    : result.error || t("camera.ocrFailedError");
                throw new Error(errorMsg);
            }

            // 4. Return extracted fields
            if (result.success && result.extractedFields) {
                onDataExtracted({
                    contract_number: result.extractedFields.contract_number,
                    user_type: result.extractedFields.user_type,
                    consumption_reading: result.extractedFields.consumption_reading,
                    service_date: result.extractedFields.service_date,
                    name: result.extractedFields.name,
                    address: result.extractedFields.address,
                    rawData: result.rawData,
                });
            } else {
                throw new Error(t("camera.noDataExtractedError"));
            }
        } catch (error: any) {
            console.error("OCR Scanner Error:", error, "| API URL:", apiUrl);
            const errorMessage = error.message || t("camera.unknownError");

            if (onError) {
                onError(errorMessage);
            } else {
                Alert.alert(t("camera.ocrErrorTitle"), errorMessage);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <TouchableOpacity
            testID="scan-receipt-button"
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
                {isProcessing ? t("camera.processingReceipt") : t("camera.scanWaterReceipt")}
            </Text>
        </TouchableOpacity>
    );
}
