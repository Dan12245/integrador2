import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert } from "react-native";
import { useRouter } from "expo-router";
import ReceiptScannerButton, { ExtractedData } from "../../components/Camera";
//aca nomas añadimos la funcion para meter edificios nuevos, de momento solo se hace con datos fijosm ando chambeando en cambiarlo
import { addBuilding } from "@/src/lib/edificios";

export default function MyBuildings() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  //campos para guardar edificios
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [description, setDescription] = useState("");

  return (
    <ScrollView className="mt-10 p-3">
      <View className="py-1 self-stretch items-center mb-5">
        <Text className="text-2xl font-bold text-[#333]">myBuildings</Text>
      </View>

      <View className="mb-5">
        <ReceiptScannerButton 
          onDataExtracted={(data) => setExtractedData(data)}
          onError={(error) => console.error(error)}
        />
      </View>

      {extractedData && (
        <View className="mb-5 p-4 bg-gray-100 rounded-lg">
          <Text className="text-lg font-bold mb-2 text-[#333]">Scanned Data:</Text>
          <Text className="text-base text-gray-800">Contract: {extractedData.contract_number || 'N/A'}</Text>
          <Text className="text-base text-gray-800">Name: {extractedData.name || 'N/A'}</Text>
          <Text className="text-base text-gray-800">Address: {extractedData.address || 'N/A'}</Text>
          <Text className="text-base text-gray-800">User Type: {extractedData.user_type || 'N/A'}</Text>
          <Text className="text-base text-gray-800">Service Date: {extractedData.service_date || 'N/A'}</Text>
          <Text className="text-base text-gray-800 font-bold mt-2">Consumption: {extractedData.consumption_reading || 'N/A'}</Text>
        </View>
      )}

      <View className="py-1 self-stretch">
        <TouchableOpacity
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/userProfile" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to User Profile</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/techSupport" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Tech Support</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity
          className="bg-[#2089dc] rounded p-3 items-center"
          onPress={() => router.push("/consumptions" as any)}
        >
          <Text className="text-white text-base font-semibold">Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity
          className="bg-[#86939e] rounded p-3 items-center"
          onPress={() => router.push("/home" as any)}
        >
          <Text className="text-white text-base font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>
      <View className="py-1 self-stretch mt-5">

        <Text className="text-black text-base font-semibold">Building Alias</Text>
        <TextInput 
        className="bg-white p-3 rounded border border-gray-300 text-black"
        value={alias} 
        onChangeText={setAlias}
        placeholder="Building Alias"/>

        <Text className="text-black text-base font-semibold">Contract number</Text>
        <TextInput 
        className="bg-white p-3 rounded border border-gray-300 text-black"
        value={contractNumber} 
        onChangeText={setContractNumber}
        placeholder="Contract Number"/>

        <Text className="text-black text-base font-semibold">Addres</Text>
        <TextInput 
        className="bg-white p-3 rounded border border-gray-300 text-black"
        value={address} 
        onChangeText={setAddress}
        placeholder="address"/>

        <Text className="text-black text-base font-semibold">Description </Text>
        <TextInput 
        className="bg-white p-3 rounded border border-gray-300 text-black"
        value={description} 
        onChangeText={setDescription}
        placeholder="Building description"/>
      </View>
      <View className="py-1 self-stretch mt-5">

        {/*Boton de prueba*/ }
        <TouchableOpacity
          className="bg-[#86939e] rounded p-3 items-center"
          onPress={async () => {
            if(!alias || !contractNumber || !address || !description){
               Alert.alert("Failed","Complete all the fields")
              return;
            }
            const answer = await addBuilding(alias, contractNumber, address, description)
            if(!answer){
              Alert.alert("Failed","The building couldn't be stored correctly")
              return;
            }
            Alert.alert("Success","The building was stored correctly")
            setAlias("");
            setAddress("");
            setContractNumber("");
            setDescription("");
          }}
        >
          <Text className="text-white text-base font-semibold">Save building</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}
