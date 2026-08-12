import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useRouter, useFocusEffect } from "expo-router";
import Animated, { FadeInLeft, FadeInRight, FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import AppNavbar from "../../components/AppNavbar";
import ReceiptScannerButton, { ExtractedData } from "../../components/Camera";
import { addBuilding, getBuildings, BuildingRecord, deleteBuilding, editBuilding } from "@/src/lib/edificios";
import { getApiUrl } from "@/src/lib/api";
import BuildingMap from "../../components/BuildingMap";

export default function MyBuildings() {
  const { t } = useTranslation();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [buildings, setBuildings] = useState<BuildingRecord[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loadingBuildings, setLoadingBuildings] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form state for adding new building
  const [alias, setAlias] = useState("");
  const [address, setAddress] = useState("");
  const [contractNumber, setContractNumber] = useState("");
  const [description, setDescription] = useState("");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Modo de seleccion de ubicacion: escribir la direccion, o tocar el mapa directamente
  const [locationMode, setLocationMode] = useState<"address" | "map">("address");

  // ---- Estado para el modal de EDITAR (separado del de agregar, mismo patron) ----
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editAlias, setEditAlias] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCoordinates, setEditCoordinates] = useState<{ lat: number; long: number } | null>(null);
  const [editLocationMode, setEditLocationMode] = useState<"address" | "map">("address");
  const [editSuggestions, setEditSuggestions] = useState<any[]>([]);
  const [editShowingSuggestions, setEditShowingSuggestions] = useState(false);

  const loadBuildings = useCallback(async () => {
    const data = await getBuildings();
    setBuildings(data ?? []);
    setLoadingBuildings(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoadingBuildings(true);
      loadBuildings();
    }, [loadBuildings])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBuildings();
  };

  const filtered = buildings.filter((b) =>
    b.alias.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: number) => {
    setBuildings((prev) => prev.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSaveBuilding = async () => {
    if (!alias || !contractNumber || !address || !description || !coordinates) {
      if (Platform.OS === "web") {
        window.alert(`${t("buildings.alertFailed")}\n${t("buildings.alertCompleteFields")}`);
      } else {
        Alert.alert(t("buildings.alertFailed"), t("buildings.alertCompleteFields"));
      }
      return;
    }

    const answer = await addBuilding(
      alias,
      contractNumber,
      address,
      description,
      coordinates.lat,
      coordinates.long
    );
    if (!answer) {
      if (Platform.OS === "web") {
        window.alert(`${t("buildings.alertFailed")}\n${t("buildings.alertSaveFailed")}`);
      } else {
        Alert.alert(t("buildings.alertFailed"), t("buildings.alertSaveFailed"));
      }
      return;
    }

    if (Platform.OS === "web") {
      window.alert(`${t("buildings.alertSuccess")}\n${t("buildings.alertSaveSuccess")}`);
    } else {
      Alert.alert(t("buildings.alertSuccess"), t("buildings.alertSaveSuccess"));
    }

    loadBuildings();

    // Reset fields & close modal window
    setAlias("");
    setAddress("");
    setContractNumber("");
    setDescription("");
    setExtractedData(null);
    setCoordinates(null);
    setSuggestions([]);
    setLocationMode("address");
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
        const res = await fetch(`${getApiUrl()}/autocomplete?q=${encodeURIComponent(address)}`);
        if (!res.ok) {
          console.log("Backend error:", res.status);
          return;
        }
        const data = await res.json();
        console.log("Features", JSON.stringify(data, null, 2))
        setSuggestions(data || []);
      } catch (error) {
        console.error("Error while searching suggestions:", error);
      }
    }, 500); // Espera 500ms
    return () => clearTimeout(delayDebounce);
  }, [address, showingSuggestions]);

  // esto es para cuando el usuario seleccione una opcion
  const selectAddress = (item: any) => {
    const { name, street, housenumber, city } = item.properties;
    const calleConNumero = `${street || ''} ${housenumber || ''}`.trim();
    const RealAdress = [name, calleConNumero, city].filter(Boolean).join(', ');

    setAddress(RealAdress);
    setShowingSuggestions(false);
    setSuggestions([]);

    const [long, lat] = item.geometry.coordinates;
    console.log("COORDS DATA:", { lat, long });
    setCoordinates({ lat, long });
  };

  const handleMapLocationSelect = async (lat: number, long: number) => {
    setCoordinates({ lat, long });

    try {
      const res = await fetch(`${getApiUrl()}/reverseGeocode?lat=${lat}&lon=${long}`);
      const data = await res.json();

      if (data.address) {
        setAddress(data.address);
      }
    } catch (error) {
      console.error("Error Error while searching map location:", error);
    }
  };

  // ---- Los mismos 3 helpers de arriba, pero para el modal de EDITAR ----

  useEffect(() => {
    if (editAddress.trim() === "" || !editShowingSuggestions) {
      setEditSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`http://192.168.0.15:8787/autocomplete?q=${encodeURIComponent(editAddress)}`);
        if (!res.ok) {
          console.log("Backend error:", res.status);
          return;
        }
        const data = await res.json();
        setEditSuggestions(data || []);
      } catch (error) {
        console.error("Error while searching suggestions (edit):", error);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [editAddress, editShowingSuggestions]);

  const selectEditAddress = (item: any) => {
    const { name, street, housenumber, city } = item.properties;
    const calleConNumero = `${street || ''} ${housenumber || ''}`.trim();
    const RealAdress = [name, calleConNumero, city].filter(Boolean).join(', ');

    setEditAddress(RealAdress);
    setEditShowingSuggestions(false);
    setEditSuggestions([]);

    const [long, lat] = item.geometry.coordinates;
    setEditCoordinates({ lat, long });
  };

  const handleEditMapLocationSelect = async (lat: number, long: number) => {
    setEditCoordinates({ lat, long });

    try {
      const res = await fetch(`http://192.168.0.15:8787/reverseGeocode?lat=${lat}&lon=${long}`);
      const data = await res.json();

      if (data.address) {
        setEditAddress(data.address);
      }
    } catch (error) {
      console.error("Error while searching map location (edit):", error);
    }
  };

  const confirmarYBorrar = async (id: number) => {
    const exito = await deleteBuilding(id);
    if (!exito) {
      if (Platform.OS === "web") {
        window.alert(`${t("buildings.alertFailed")}\n${t("buildings.alertDeleteFailed")}`);
      } else {
        Alert.alert(t("buildings.alertFailed"), t("buildings.alertDeleteFailed"));
      }
      return;
    }
    handleDelete(id);
    if (Platform.OS === "web") {
      window.alert(`${t("buildings.alertSuccess")}\n${t("buildings.alertDeleteSuccess")}`);
    } else {
      Alert.alert(t("buildings.alertSuccess"), t("buildings.alertDeleteSuccess"));
    }
  };

  const confirmarBorrado = (id: number, nombreEdificio: string) => {
    if (Platform.OS === "web") {
      const seguro = window.confirm(t("buildings.deleteBuildingConfirm", { name: nombreEdificio }));  
      if (seguro) {
        console.log("Borrando desde la web el ID:", id);
        confirmarYBorrar(id);
      }
    } else {
      Alert.alert(
        t("buildings.deleteBuildingTitle"),
        t("buildings.deleteBuildingConfirm", { name: nombreEdificio }),
        [
          { text: t("buildings.cancel"), style: "cancel" },
          { 
            text: t("buildings.delete"), 
            style: "destructive", 
            onPress: () => confirmarYBorrar(id)
          }
        ]
      );
    }
  };

  const openEditModal = (item: BuildingRecord) => {
    setEditId(item.id);
    setEditAlias(item.alias);
    setEditDescription(item.description || "");
    // Precargamos tambien la direccion y las coordenadas actuales del building
    setEditAddress(item.address || "");
    setEditCoordinates(
      item.lat != null && item.longitude != null
        ? { lat: item.lat, long: item.longitude }
        : null
    );
    setEditLocationMode("address");
    setEditSuggestions([]);
    setEditShowingSuggestions(false);
    setShowEditForm(true);
  };

  const closeEditModal = () => {
    setShowEditForm(false);
    setEditId(null);
    setEditAlias("");
    setEditDescription("");
    setEditAddress("");
    setEditCoordinates(null);
    setEditLocationMode("address");
    setEditSuggestions([]);
    setEditShowingSuggestions(false);
  };

  const handleUpdateBuilding = async () => {
    if (!editId || !editAlias || !editDescription || !editAddress || !editCoordinates) {
      if (Platform.OS === "web") {
        window.alert(`${t("buildings.alertFailed")}\n${t("buildings.alertCompleteFields")}`);
      } else {
        Alert.alert(t("buildings.alertFailed"), t("buildings.alertCompleteFields"));
      }
      return;
    }

    const success = await editBuilding(
      editId,
      editAlias,
      editDescription,
      editAddress,
      editCoordinates.lat,
      editCoordinates.long
    );

    if (success) {
      closeEditModal();
      loadBuildings();
      if (Platform.OS === "web") {
        window.alert(`${t("buildings.alertSuccess")}\n${t("buildings.alertUpdateSuccess")}`);
      } else {
        Alert.alert(t("buildings.alertSuccess"), t("buildings.alertUpdateSuccess"));
      }
    } else {
      if (Platform.OS === "web") {
        window.alert(`${t("buildings.alertFailed")}\n${t("buildings.alertUpdateFailed")}`);
      } else {
        Alert.alert(t("buildings.alertFailed"), t("buildings.alertUpdateFailed"));
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#f4f6f8]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <KeyboardAwareScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1" bottomOffset={20}>
        <View className="flex-1 flex-col md:flex-row p-4 gap-4">

          <Animated.View
            entering={FadeInLeft.duration(400).springify()}
            className="w-full md:w-80 gap-3"
          >
            <Text className="text-2xl font-bold text-[#0d1b2e] mb-1">{t("buildings.title")}</Text>

            <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 border border-gray-200 gap-2 mb-2">
              <TextInput
                className="flex-1 text-sm text-gray-700"
                placeholder={t("buildings.searchPlaceholder")}
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
              <TouchableOpacity onPress={onRefresh} disabled={refreshing}>
                <Text className="text-gray-400">{refreshing ? "⏳" : "🔄"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-center bg-[#2089dc] rounded-2xl py-3.5 gap-2 mb-2 shadow-sm active:bg-[#1976d2]"
              onPress={() => setShowAddForm(true)}
            >
              <Text className="text-white font-bold text-sm">{t("buildings.addNewBuilding")}</Text>
            </TouchableOpacity>

            {loadingBuildings ? (
              <View className="items-center py-8">
                <Text className="text-gray-400 text-sm">{t("buildings.loadingBuildings")}</Text>
              </View>
            ) : (
              <FlatList
                data={filtered}
                keyExtractor={(b) => b.id.toString()}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View className="h-3" />}
                ListEmptyComponent={
                  <View className="items-center py-8">
                    <Text className="text-gray-400 text-sm">
                      {t("buildings.noBuildingsYet")}
                    </Text>
                  </View>
                }
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
                      <View className="flex-row items-center gap-3 flex-shrink">
                        <View className="w-9 h-9 rounded-xl bg-[#0d1b2e] items-center justify-center">
                          <Text className="text-white text-base">🏢</Text>
                        </View>
                        <View className="flex-shrink">
                          <Text className="text-sm font-semibold text-[#0d1b2e]" numberOfLines={1}>
                            {item.alias}
                          </Text>
                          <Text className="text-xs text-gray-400" numberOfLines={1}>
                            {item.address}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-3">
                        <TouchableOpacity onPress={() => openEditModal(item)}>
                          <Text className="text-[#2089dc] text-base">✏️</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => confirmarBorrado(item.id, item.alias)}>
                          <Text className="text-red-400 text-base">🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              />
            )}
          </Animated.View>

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
              {/* Movida a bottom-left para no chocar con el control de zoom
                  default de Leaflet, que se posiciona en top-left */}
              <View
                className="absolute bottom-4 left-4 bg-white rounded-xl px-4 py-3 z-10"
                style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}
              >
                <Text className="text-sm font-bold text-[#0d1b2e]">{t("buildings.facilityLocations")}</Text>
                <Text className="text-xs text-gray-500">{t("buildings.activeMonitoringSites", { count: buildings.length })}</Text>
              </View>

              {/* Botones de zoom custom eliminados: se usan los que trae
                  Leaflet por default (arriba a la izquierda del mapa) */}

              <View className="flex-1">
                <BuildingMap
                  lat={coordinates?.lat ?? null}
                  long={coordinates?.long ?? null}
                  addressLabel={address}
                  onLocationSelect={handleMapLocationSelect}
                />
              </View>
            </Animated.View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {/* VENTANA EMERGENTE (MODAL): Agregar Nuevo Edificio */}
      <Modal
        visible={showAddForm}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAddForm(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.65)" }}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 16 }}
            showsVerticalScrollIndicator={false}
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
              <Text className="text-xl font-black text-[#0d1b2e]">{t("buildings.addBuildingModalTitle")}</Text>
              <TouchableOpacity
                onPress={() => setShowAddForm(false)}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-500 font-bold text-base">✕</Text>
              </TouchableOpacity>
            </View>

            {extractedData && (
              <View className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <Text className="text-xs font-bold text-blue-900 mb-1">{t("buildings.scannedReceiptData")}</Text>
                <Text className="text-xs text-blue-800">{t("buildings.contract")}: {extractedData.contract_number || t("buildings.notAvailable")}</Text>
                <Text className="text-xs text-blue-800">{t("buildings.address")}: {extractedData.address || t("buildings.notAvailable")}</Text>
                <Text className="text-xs text-blue-800 font-semibold mt-1">
                  {t("buildings.reading")}: {extractedData.consumption_reading || t("buildings.notAvailable")}
                </Text>
              </View>
            )}

            <View className="gap-3">
              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">{t("buildings.buildingAlias")}</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={alias}
                  onChangeText={setAlias}
                  placeholder={t("buildings.aliasPlaceholder")}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">{t("buildings.contractNumber")}</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={contractNumber}
                  onChangeText={setContractNumber}
                  placeholder={t("buildings.contractNumberPlaceholder")}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              <View className="relative z-50">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-semibold text-gray-700">{t("buildings.addressLabel")}</Text>
                  <View className="flex-row bg-gray-100 rounded-lg p-0.5">
                    <TouchableOpacity
                      onPress={() => {
                        setLocationMode("address");
                        setShowingSuggestions(false);
                      }}
                      className="px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: locationMode === "address" ? "#ffffff" : "transparent" }}
                    >
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: locationMode === "address" ? "#0d1b2e" : "#9ca3af" }}
                      >
                         {t("buildings.typeIt")}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setLocationMode("map");
                        setShowingSuggestions(false);
                        setSuggestions([]);
                      }}
                      className="px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: locationMode === "map" ? "#ffffff" : "transparent" }}
                    >
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: locationMode === "map" ? "#0d1b2e" : "#9ca3af" }}
                      >
                         {t("buildings.pickOnMap")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {locationMode === "address" ? (
                  <>
                    <TextInput
                      className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                      style={{ backgroundColor: "#f8fafc" }}
                      value={address}
                      onChangeText={(text) => {
                        setAddress(text);
                        setShowingSuggestions(true);
                      }}
                      placeholder={t("buildings.addressPlaceholder")}
                      placeholderTextColor="#9ca3af"
                    />
                    {suggestions.length > 0 && showingSuggestions && (
                      <View className="bg-white border border-gray-300 rounded-xl mt-1 shadow-sm absolute top-[100%] left-0 right-0 max-h-48 overflow-hidden z-50">
                        {suggestions?.map((item, index) => (
                          <TouchableOpacity
                            key={item.properties.osm_id || index}
                            className="p-3 border-b border-gray-100"
                            onPress={() => selectAddress(item)}
                          >
                            <Text className="font-bold text-black text-sm">
                              {item.properties.name || item.properties.street}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                              {item.properties.city} {item.properties.state}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View>
                    <View
                      style={{
                        height: 200,
                        borderRadius: 12,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                      }}
                    >
                      <BuildingMap
                        lat={coordinates?.lat ?? null}
                        long={coordinates?.long ?? null}
                        addressLabel={address}
                        onLocationSelect={handleMapLocationSelect}
                      />
                    </View>
                    <Text className="text-[11px] text-gray-400 mt-1">
                      {t("buildings.tapMapInstruction")}
                    </Text>
                    {/* Barrita editable: el usuario puede corregir a mano la
                        direccion que devolvio el reverse geocoding */}
                    <TextInput
                      className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                      style={{ backgroundColor: "#f8fafc" }}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Address will appear here after tapping the map"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                )}
              </View>

              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">{t("buildings.descriptionLabel")}</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={description}
                  onChangeText={setDescription}
                  placeholder={t("buildings.descriptionPlaceholder")}
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
                <Text className="text-white text-base font-semibold">{t("buildings.saveBuilding")}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

      {/* VENTANA EMERGENTE (MODAL): Editar Edificio */}
      <Modal
        visible={showEditForm}
        animationType="fade"
        transparent
        onRequestClose={closeEditModal}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0, 0, 0, 0.65)" }}>
          <KeyboardAwareScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 16 }}
            showsVerticalScrollIndicator={false}
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
              <Text className="text-xl font-black text-[#0d1b2e]">{t("buildings.editBuildingModalTitle")}</Text>
              <TouchableOpacity
                onPress={closeEditModal}
                className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
              >
                <Text className="text-gray-500 font-bold text-base">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">{t("buildings.buildingAlias")}</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={editAlias}
                  onChangeText={setEditAlias}
                  placeholder={t("buildings.aliasPlaceholder")}
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Mismo bloque de direccion que en el modal de agregar,
                  reusando el patron "Type it / Pick on map" */}
              <View className="relative z-50">
                <View className="flex-row items-center justify-between mb-1">
                  <Text className="text-xs font-semibold text-gray-700">Address</Text>
                  <View className="flex-row bg-gray-100 rounded-lg p-0.5">
                    <TouchableOpacity
                      onPress={() => {
                        setEditLocationMode("address");
                        setEditShowingSuggestions(false);
                      }}
                      className="px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: editLocationMode === "address" ? "#ffffff" : "transparent" }}
                    >
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: editLocationMode === "address" ? "#0d1b2e" : "#9ca3af" }}
                      >
                         Type it
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => {
                        setEditLocationMode("map");
                        setEditShowingSuggestions(false);
                        setEditSuggestions([]);
                      }}
                      className="px-2.5 py-1 rounded-md"
                      style={{ backgroundColor: editLocationMode === "map" ? "#ffffff" : "transparent" }}
                    >
                      <Text
                        className="text-[11px] font-semibold"
                        style={{ color: editLocationMode === "map" ? "#0d1b2e" : "#9ca3af" }}
                      >
                         Pick on map
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {editLocationMode === "address" ? (
                  <>
                    <TextInput
                      className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                      style={{ backgroundColor: "#f8fafc" }}
                      value={editAddress}
                      onChangeText={(text) => {
                        setEditAddress(text);
                        setEditShowingSuggestions(true);
                      }}
                      placeholder="Address"
                      placeholderTextColor="#9ca3af"
                    />
                    {editSuggestions.length > 0 && editShowingSuggestions && (
                      <View className="bg-white border border-gray-300 rounded-xl mt-1 shadow-sm absolute top-[100%] left-0 right-0 max-h-48 overflow-hidden z-50">
                        {editSuggestions?.map((item, index) => (
                          <TouchableOpacity
                            key={item.properties.osm_id || index}
                            className="p-3 border-b border-gray-100"
                            onPress={() => selectEditAddress(item)}
                          >
                            <Text className="font-bold text-black text-sm">
                              {item.properties.name || item.properties.street}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                              {item.properties.city} {item.properties.state}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </>
                ) : (
                  <View>
                    <View
                      style={{
                        height: 200,
                        borderRadius: 12,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#e5e7eb",
                      }}
                    >
                      <BuildingMap
                        lat={editCoordinates?.lat ?? null}
                        long={editCoordinates?.long ?? null}
                        addressLabel={editAddress}
                        onLocationSelect={handleEditMapLocationSelect}
                      />
                    </View>
                    <Text className="text-[11px] text-gray-400 mt-1 mb-1">
                      Tap anywhere on the map to set the location.
                    </Text>
                    {/* Barrita editable, igual que en el modal de agregar */}
                    <TextInput
                      className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                      style={{ backgroundColor: "#f8fafc" }}
                      value={editAddress}
                      onChangeText={setEditAddress}
                      placeholder="Address will appear here after tapping the map"
                      placeholderTextColor="#9ca3af"
                    />
                  </View>
                )}
              </View>

              <View>
                <Text className="text-xs font-semibold text-gray-700 mb-1">{t("buildings.descriptionLabel")}</Text>
                <TextInput
                  className="bg-gray-50 p-3 rounded-xl border border-gray-200 text-sm text-gray-800"
                  style={{ backgroundColor: "#f8fafc" }}
                  value={editDescription}
                  onChangeText={setEditDescription}
                  placeholder={t("buildings.descriptionPlaceholder")}
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View className="mt-2 gap-3">
              <TouchableOpacity
                className="bg-[#2089dc] rounded-xl py-3.5 items-center shadow-sm active:bg-[#1976d2]"
                onPress={handleUpdateBuilding}
              >
                <Text className="text-white text-base font-semibold">{t("buildings.saveChanges")}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
          </KeyboardAwareScrollView>
        </View>
      </Modal>

    </SafeAreaView>
  );
}