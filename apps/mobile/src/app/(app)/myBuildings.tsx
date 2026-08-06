import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInLeft, FadeInRight, FadeInDown } from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";
import ReceiptScannerButton, { ExtractedData } from "../../components/Camera";
import { addBuilding } from "@/src/lib/edificios";
import BuildingMap from "../../components/BuildingMap";

interface Building {
  id: string;
  name: string;
  type: string;
  icon: string;
}

const INITIAL_BUILDINGS: Building[] = [
  { id: "1", name: "Petco", type: "Building", icon: "🏢" },
  { id: "2", name: "Main House", type: "House", icon: "🏠" },
  { id: "3", name: "Logistics center", type: "Warehouse", icon: "🏭" },
];

export default function MyBuildings() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [selectedId, setSelectedId] = useState<string | null>("1");

  // Form state for adding new building
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [description, setDescription] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = buildings.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setBuildings((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSaveBuilding = async () => {
    if (!alias || !contractNumber || !address || !description) {
      if (Platform.OS === "web") {
        window.alert("Failed\nComplete all the fields");
      } else {
        Alert.alert("Failed", "Complete all the fields");
      }
      return;
    }

    const answer = await addBuilding(alias, contractNumber, address, description);
    if (!answer) {
      if (Platform.OS === "web") {
        window.alert("Failed\nThe building couldn't be stored correctly");
      } else {
        Alert.alert("Failed", "The building couldn't be stored correctly");
      }
      return;
    }

    if (Platform.OS === "web") {
      window.alert("Success.\nThe building was stored correctly");
    } else {
      Alert.alert("Success", "The building was stored correctly");
    }

    // Append to local state list
    const newB: Building = {
      id: Date.now().toString(),
      name: alias,
      type: "Building",
      icon: "🏢",
    };
    setBuildings((prev) => [...prev, newB]);

    // Reset fields & close modal window
    setAlias("");
    setAddress("");
    setContractNumber("");
    setDescription("");
    setExtractedData(null);
    setShowAddForm(false);
  };

  //esta wea es para las coordenadas y q jale el mapa
  const [coordinates, setCoordinates] = useState<{ lat: number; long: number } | null>(null); 

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
          console.log("Backend error:", res.status);
          return; 
        }
        const data = await res.json();
        console.log("Features",JSON.stringify(data, null, 2))
        setSuggestions(data || []);
      } catch (error) {
        console.error("Error while searching suggestions:", error);
      }
    }, 500); // Espera 500ms
    return () => clearTimeout(delayDebounce);
  }, [address, showingSuggestions]);
  
    // esta wea es para cuando el usuario seleccione una opcion
    const selectAddress = (item: any) => {
    const { name, street, housenumber, city } = item.properties;
    // Armamos el texto. Si tiene nombre lo ponemos, si no solo la calle y ciudad.
    const calleConNumero = `${street || ''} ${housenumber || ''}`.trim();

    // 2. Metemos todo a un arreglo y usamos un truco ninja (.filter(Boolean)) 
    // para quitar los datos que vengan vacíos y unir el resto con comas.
    const RealAdress = [name, calleConNumero, city].filter(Boolean).join(', ');
        
    setAddress(RealAdress);
    setShowingSuggestions(false); // Ocultamos la lista para que no siga buscando
    setSuggestions([]);

    // Photon ya nos da las coordenadas en la misma sugerencia, ojo que vienen como [long, lat]
    const [long, lat] = item.geometry.coordinates;
    console.log("COORDS DATA:", { lat, long });
    setCoordinates({ lat, long });
  };

  //una funcion para q el usuaio pueda seleccionar su ubi directo del mapa
  const handleMapLocationSelect = async (lat: number, long: number) => {
    // Actualizamos coordenadas de una vez para que el marker/mapa reaccione rápido
    setCoordinates({ lat, long });

    try {
      const res = await fetch(`http://192.168.0.15:8787/reverseGeocode?lat=${lat}&lon=${long}`);
      const data = await res.json();

      if (data.address) {
        setAddress(data.address);
      }
    } catch (error) {
      console.error("Error al buscar la dirección desde el mapa:", error);
    }
  };
  

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        {/* Contenedor general principal */}
        <View className="flex-1 flex-col md:flex-row p-4 gap-4">
          {/* BARRA LATERAL IZQUIERDA: My Buildings List */}
          <Animated.View
            entering={FadeInLeft.duration(400).springify()}
            className="w-full md:w-80 gap-3"
          >
            <Text className="text-2xl font-bold text-[#0d1b2e] mb-1">My Buildings</Text>

            {/* BUSCADOR */}
            <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 border border-gray-200 gap-2 mb-2">
              <TextInput
                className="flex-1 text-sm text-gray-700"
                placeholder="Search"
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
              <Text className="text-gray-400">🔍</Text>
            </View>

            {/* BOTON AGREGAR EDIFICIO (Abre ventana emergente) */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#2089dc] rounded-2xl py-3.5 gap-2 mb-2 shadow-sm active:bg-[#1976d2]"
              onPress={() => setShowAddForm(true)}
            >
              <Text className="text-white font-bold text-sm">+ Add new building</Text>
            </TouchableOpacity>

            {/* LISTA DE EDIFICIOS */}
            <FlatList
              data={filtered}
              keyExtractor={(b) => b.id}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View className="h-3" />}
              renderItem={({ item, index }) => (
                <Animated.View entering={FadeInDown.delay(index * 80).duration(350)}>
                  <TouchableOpacity
                    onPress={() => setSelectedId(item.id)}
                    className={`flex-row items-center justify-between rounded-2xl px-4 py-4 border bg-white ${
                      selectedId === item.id ? "border-[#2089dc]" : "border-gray-200"
                    }`}
                    style={{
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 4,
                      elevation: 2,
                    }}
                  >
                    <View className="flex-row items-center gap-3">
                      <View className="w-9 h-9 rounded-xl bg-[#0d1b2e] items-center justify-center">
                        <Text className="text-white text-base">{item.icon}</Text>
                      </View>
                      <View>
                        <Text className="text-sm font-semibold text-[#0d1b2e]">{item.name}</Text>
                        <Text className="text-xs text-gray-400">{item.type}</Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-3">
                      <TouchableOpacity>
                        <Text className="text-[#2089dc] text-base">✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item.id)}>
                        <Text className="text-red-400 text-base">🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              )}
            />
          </Animated.View>

          {/* AREA PRINCIPAL DERECHA: Mapa Placeholder con tamaño vertical ampliado */}
          <View className="flex-1">
            <Animated.View
              entering={FadeInRight.duration(450).springify()}
              className="w-full bg-[#c8dce8] rounded-3xl overflow-hidden relative"
              style={{
                height: 600,
                minHeight: 520,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* Etiqueta Facility Locations */}
              <View
                className="absolute top-4 left-4 bg-white rounded-xl px-4 py-3 z-10"
                style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}
              >
                <Text className="text-sm font-bold text-[#0d1b2e]">Facility Locations</Text>
                <Text className="text-xs text-gray-500">{buildings.length} active monitoring sites</Text>
              </View>

              {/* Controles de zoom */}
              <View
                className="absolute top-4 right-4 bg-white rounded-xl overflow-hidden z-10"
                style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}
              >
                <TouchableOpacity className="px-3 py-2 border-b border-gray-100">
                  <Text className="text-lg text-[#0d1b2e] font-bold">+</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-3 py-2">
                  <Text className="text-lg text-[#0d1b2e] font-bold">−</Text>
                </TouchableOpacity>
              </View>

              {/* Contenido centrado del mapa */}
              <View className="flex-1 items-center justify-center">
                <View className="w-80 h-80 rounded-full bg-blue-400/20 border border-blue-400/40 items-center justify-center">
                  <View className="w-6 h-6 rounded-full bg-[#0d1b2e] border-2 border-white" />
                </View>

                <View className="absolute top-20 left-1/3">
                  <Text className="text-3xl">📍</Text>
                </View>
                <View className="absolute top-36 right-1/4">
                  <Text className="text-3xl">📍</Text>
                </View>
                <View className="absolute bottom-28 left-1/4">
                  <Text className="text-3xl">📍</Text>
                </View>

                <Text className="absolute bottom-4 text-gray-400 text-xs">
                  Facility Map — integrates react-native-maps
                </Text>
              </View>
            </Animated.View>
          </View>
        </View>
      </ScrollView>

      {/* VENTANA EMERGENTE (MODAL): Agregar Nuevo Edificio */}
      <Modal
        visible={showAddForm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddForm(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.65)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <Animated.View
            entering={FadeInDown.duration(300)}
            style={{
              width: "100%",
              maxWidth: 520,
              backgroundColor: "#ffffff",
              borderRadius: 28,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 24,
              elevation: 12,
              gap: 16,
            }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 pb-3">
              <Text className="text-xl font-black text-[#0d1b2e]">Add New Building</Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-500 font-bold text-base">✕</Text>
              </TouchableOpacity>
            </View>

            {extractedData && (
              <View className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <Text className="text-xs font-bold text-blue-900 mb-1">Scanned Receipt Data:</Text>
                <Text className="text-xs text-blue-800">Contract: {extractedData.contract_number || "N/A"}</Text>
                <Text className="text-xs text-blue-800">Address: {extractedData.address || "N/A"}</Text>
                <Text className="text-xs text-blue-800 font-semibold mt-1">
                  Reading: {extractedData.consumption_reading || "N/A"}
                </Text>
              </View>
            )}

            <View className="gap-3">
              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">Building Alias</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={alias}
                  onChangeText={setAlias}
                  placeholder="e.g. Petco Center"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">Contract Number</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={contractNumber}
                  onChangeText={setContractNumber}
                  placeholder="Contract Number"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">Address</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={address}
                  value={address} 
                    onChangeText={(text) => {
                      setAddress(text);
                      setShowingSuggestions(true); // Al teclear la direccion se llama a la wea de las sugerencias
                    }}
                  placeholder="Address"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">Description</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Building description"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mt-2 gap-3">
              <ReceiptScannerButton
                onDataExtracted={(data) => {
                  setExtractedData(data);
                  if (data.contract_number) setContractNumber(data.contract_number);
                  if (data.address) setAddress(data.address);
                  if (data.name) setAlias(data.name);
                }}
              />

              <TouchableOpacity
                testID="mybuildings-save-building-button"
                className="bg-[#2089dc] rounded-xl py-3.5 items-center shadow-sm active:bg-[#1976d2]"
                onPress={handleSaveBuilding}
              >
                <Text className="text-white text-base font-semibold">Save building</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}