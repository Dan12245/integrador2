import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import ReceiptScannerButton, { ExtractedData } from "../../components/Camera";
import { addBuilding } from "@/src/lib/edificios";

export default function MyBuildings() {
  const router = useRouter();
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [description, setDescription] = useState("");

  // Estas weas nos sirven para autocompletar busquedas
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showingSuggestions, setShowingSuggestions] = useState(false);

  // Esto es para hacer un "debounce" y evitar que la api de photon nos banee por mandarle un monton de peticiones
  useEffect(() => {
    if (address.trim() === "" || !showingSuggestions) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`http://192.168.0.15:8787/autocomplete?q=${encodeURIComponent(address)}`);
        if (!res.ok) {
  console.log("El backend regresó un error:", res.status);
  return; 
}
        const data = await res.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error al buscar suggestions:", error);
      }
    }, 500); // Espera 500ms

    return () => clearTimeout(delayDebounce);
  }, [address, showingSuggestions]);

  // esta wea es para cuando el usuario seleccione una opcion
  const selectAdrress = (item: any) => {
    const { name, street, city } = item.properties;
    // Armamos el texto. Si tiene nombre lo ponemos, si no solo la calle y ciudad.
    const RealAdress = `${name ? name + ', ' : ''}${street ? street + ', ' : ''}${city || ''}`;
    
    setAddress(RealAdress);
    setShowingSuggestions(false); // Ocultamos la lista para que no siga buscando
    setSuggestions([]);
  };

  return (
    <ScrollView className="mt-10 p-3" keyboardShouldPersistTaps="handled">
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

      {/* ... (Botones de navegación intactos) ... */}
      <View className="py-1 self-stretch">
        <TouchableOpacity testID="mybuildings-user-profile-button" className="bg-[#2089dc] rounded p-3 items-center" onPress={() => router.push("/userProfile" as any)}>
          <Text className="text-white text-base font-semibold">Go to User Profile</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity testID="mybuildings-tech-support-button" className="bg-[#2089dc] rounded p-3 items-center" onPress={() => router.push("/techSupport" as any)}>
          <Text className="text-white text-base font-semibold">Go to Tech Support</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch">
        <TouchableOpacity testID="mybuildings-consumptions-button" className="bg-[#2089dc] rounded p-3 items-center" onPress={() => router.push("/consumptions" as any)}>
          <Text className="text-white text-base font-semibold">Go to Consumptions</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">
        <TouchableOpacity testID="mybuildings-back-home-button" className="bg-[#86939e] rounded p-3 items-center" onPress={() => router.push("/home" as any)}>
          <Text className="text-white text-base font-semibold">Back to Home</Text>
        </TouchableOpacity>
      </View>

      <View className="py-1 self-stretch mt-5">

        <Text className="text-black text-base font-semibold">Building Alias</Text>
        <TextInput 
          className="bg-white p-3 rounded border border-gray-300 text-black mb-3"
          value={alias} 
          onChangeText={setAlias}
          placeholder="Building Alias"
        />

        <Text className="text-black text-base font-semibold">Contract number</Text>
        <TextInput 
          className="bg-white p-3 rounded border border-gray-300 text-black mb-3"
          value={contractNumber} 
          onChangeText={setContractNumber}
          placeholder="Contract Number"
        />

        <Text className="text-black text-base font-semibold">Address</Text>
        <View className="relative z-50 mb-3">
          <TextInput 
            className="bg-white p-3 rounded border border-gray-300 text-black"
            value={address} 
            onChangeText={(text) => {
              setAddress(text);
              setShowingSuggestions(true); // Al teclear, activamos la búsqueda
            }}
            placeholder="Search address..."
          />
          
          {/* NUEVO: La lista de suggestions que se dibuja abajo del input */}
          {suggestions.length > 0 && showingSuggestions && (
            <View className="bg-white border border-gray-300 rounded mt-1 shadow-sm absolute top-[100%] left-0 right-0 max-h-48 overflow-hidden z-50">
              {suggestions.map((item, index) => (
                <TouchableOpacity 
                  key={item.properties.osm_id || index} 
                  className="p-3 border-b border-gray-200"
                  onPress={() => selectAdrress(item)}
                >
                  <Text className="font-bold text-black">{item.properties.name || item.properties.street}</Text>
                  <Text className="text-gray-500 text-sm">{item.properties.city} {item.properties.state}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <Text className="text-black text-base font-semibold">Description</Text>
        <TextInput 
          className="bg-white p-3 rounded border border-gray-300 text-black mb-3"
          value={description} 
          onChangeText={setDescription}
          placeholder="Building description"
        />
      </View>

      <View className="py-1 self-stretch mt-5 mb-10">
        {/* Boton de Guardar Intacto */}
        <TouchableOpacity
          testID="mybuildings-save-building-button"
          className="bg-[#86939e] rounded p-3 items-center"
          onPress={async () => {
            if(!alias || !contractNumber || !address || !description){
              if (Platform.OS=="web") {
                window.alert("Failed\nComplete all the fields")
              }else{
                Alert.alert("Failed","Complete all the fields")
              }
              return;
            }
            // Aquí se manda a llamar a addBuilding q hace el fetch de Nominatim
            const answer = await addBuilding(alias, contractNumber, address, description)
            if(!answer){
              if (Platform.OS=="web") {
                window.alert("Failed\nThe building couldn't be stored correctly")
              }else{
                Alert.alert("Failed","The building couldn't be stored correctly")
              }
              return;
            }
            if (Platform.OS == "web") {
              window.alert('Success.\nThe building was stored correctly')
            } else {
              Alert.alert("Success","The building was stored correctly")
            }
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