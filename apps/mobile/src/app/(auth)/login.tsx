import { View } from "react-native";
import SignInForm from "../../components/SignInForm";

export default function Login() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <SignInForm />
    </View>
  );
}
