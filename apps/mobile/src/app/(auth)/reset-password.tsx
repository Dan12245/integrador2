import { View } from "react-native";
import { Image } from "expo-image";
import ResetPasswordForm from "../../components/ResetPasswordForm";

export default function ResetPassword() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* IMAGEN DE FONDO
          Cambia la ruta por la de tu imagen de agua.
          Debe estar en assets/ al mismo nivel que este archivo. */}
      <Image
        source={require("../../assets/images/login-bg.gif")}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        contentFit="cover"
      />
      <View style={{ zIndex: 1, width: "100%", flex: 1 }}>
        <ResetPasswordForm />
      </View>
    </View>
  );
}
