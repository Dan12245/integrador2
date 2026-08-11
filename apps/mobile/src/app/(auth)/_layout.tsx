import { Stack } from "expo-router";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";

export default function AuthLayout() {
    return (
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
            <Stack
                screenOptions={{
                    headerShown: false, // Hide headers for login/register pages
                    contentStyle: { backgroundColor: "#fff" }, // Consistent background
                }}
            />
        </KeyboardAvoidingView>
    );
}
