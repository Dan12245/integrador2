import { View } from "react-native";
import SignInForm from "../../components/SignInForm";

import { Image } from "expo-image";



export default function Login() {
  return (

    <View className="flex-1 items-center justify-center bg-white">
      <Image
        source={require("../../assets/images/login-bg.gif")}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
        contentFit="cover"
      />
      <View style ={{zIndex: 1}}>
        
        <SignInForm />
      </View>
      
    </View>
  );
}
