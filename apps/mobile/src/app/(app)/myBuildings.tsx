import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInLeft, FadeInRight, FadeInDown } from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";

interface Building {
  id: string;
  name: string;
  type: string;
  icon: string;
}

const INITIAL_BUILDINGS: Building[] = [
  { id: "1", name: "Petco",            type: "Building",  icon: "🏢" },
  { id: "2", name: "Main House",       type: "House",     icon: "🏠" },
  { id: "3", name: "Logistics center", type: "Warehouse", icon: "🏭" },
];

export default function MyBuildings() {
  const [search, setSearch]       = useState("");
  const [buildings, setBuildings] = useState<Building[]>(INITIAL_BUILDINGS);
  const [selectedId, setSelectedId] = useState<string | null>("1");

  const filtered = buildings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setBuildings(prev => prev.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    // Fondo gris muy claro para toda la pantalla
    <SafeAreaView className="flex-1 bg-[#f4f6f8]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      {/* Contenedor general con padding para que nada toque los bordes */}
      <View className="flex-1 flex-row p-4 gap-4">

        {/* BARRA LATERAL IZQUIERDA
            · w-72  -> ancho fijo del sidebar
            · gap-3 -> espacio entre cada elemento del sidebar
            No tiene borde derecho: la separación la da el gap del padre */}
        <Animated.View
          entering={FadeInLeft.duration(400).springify()}
          className="w-72 gap-3"
        >
          {/* Título My Buildings */}
          <Text className="text-2xl font-bold text-[#0d1b2e] mb-3">My Buildings</Text>
                  
          {/* BUSCADOR */}
          <View className="flex-row items-center bg-white rounded-2xl px-4 py-2 border border-gray-200 gap-2 mb-3">
            <TextInput
              className="flex-1 text-sm text-gray-700"
              placeholder="Search"
              placeholderTextColor="#9ca3af"
              value={search}
              onChangeText={setSearch}
            />
            <Text className="text-gray-400">🔍</Text>
          </View>
                  
          {/* BOTON AGREGAR EDIFICIO */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-[#2089dc] rounded-2xl py-3 gap-2 mb-3"
          >
            <Text className="text-white font-semibold text-sm">+ Add new building</Text>
          </TouchableOpacity>

          {/* LISTA DE EDIFICIOS
              Cada item es un recuadro independiente con espacio entre ellos */}
          <FlatList
            data={filtered}
            keyExtractor={b => b.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index * 80).duration(350)}>
                {/* RECUADRO DE EDIFICIO
                    · p-4 → padding para dejar espaciado */}
                <TouchableOpacity
                  onPress={() => setSelectedId(item.id)}
                  className={`flex-row items-center justify-between rounded-2xl px-4 py-4 border bg-white ${
                    selectedId === item.id
                      ? "border-[#2089dc]"   // borde azul cuando está seleccionado
                      : "border-gray-200"    // borde gris cuando no está seleccionado
                  }`}
                  style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                >
                  {/* Icono + nombre + tipo */}
                  <View className="flex-row items-center gap-3">
                    <View className="w-9 h-9 rounded-xl bg-[#0d1b2e] items-center justify-center">
                      <Text className="text-white text-base">{item.icon}</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-[#0d1b2e]">{item.name}</Text>
                      <Text className="text-xs text-gray-400">{item.type}</Text>
                    </View>
                  </View>

                  {/* Botones editar y eliminar */}
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

        {/* ── MAPA PLACEHOLDER ───────────────────────────────────────────
            · flex-1     → ocupa todo el espacio restante a la derecha
            · overflow-hidden → el contenido interno respeta el redondeo
            
            ===== CUANDO VAYAN A INTEGRAR LA API DEL MAPA REEMPLACEN ESTE VIEW POR EL COMPONENTE DE VERDAD ===== */}
        
        <Animated.View
          entering={FadeInRight.duration(450).springify()}
          className="flex-1 bg-[#c8dce8] rounded-3xl overflow-hidden"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 4,
          }}
        >
          {/* Etiqueta "Facility Locations" — esquina superior izquierda */}
          <View className="absolute top-4 left-4 bg-white rounded-xl px-4 py-3 z-10"
            style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}
          >
            <Text className="text-sm font-bold text-[#0d1b2e]">Facility Locations</Text>
            <Text className="text-xs text-gray-500">{buildings.length} active monitoring sites</Text>
          </View>

          {/* Controles de zoom (obviamente solo visuales) */}
          <View className="absolute top-4 right-4 bg-white rounded-xl overflow-hidden z-10"
            style={{ shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 }}
          >
            <TouchableOpacity className="px-3 py-2 border-b border-gray-100">
              <Text className="text-lg text-[#0d1b2e] font-bold">+</Text>
            </TouchableOpacity>
            <TouchableOpacity className="px-3 py-2">
              <Text className="text-lg text-[#0d1b2e] font-bold">−</Text>
            </TouchableOpacity>
          </View>

          {/* Contenido del mapa placeholder — centrado */}
          <View className="flex-1 items-center justify-center">
            {/* Círculo azul que simula el radio de cobertura */}
            <View className="w-72 h-72 rounded-full bg-blue-400/20 border border-blue-400/40 items-center justify-center">
              <View className="w-5 h-5 rounded-full bg-[#0d1b2e] border-2 border-white" />
            </View>

            {/* Marcadores de ubicación */}
            <View className="absolute top-20 left-1/3">
              <Text className="text-2xl">📍</Text>
            </View>
            <View className="absolute top-32 right-1/4">
              <Text className="text-2xl">📍</Text>
            </View>
            <View className="absolute bottom-28 left-1/4">
              <Text className="text-2xl">📍</Text>
            </View>

            {/* Texto indicador del placeholder */}
            <Text className="absolute bottom-6 text-gray-400 text-xs">
              Mapa placeholder — integra react-native-maps aquí
            </Text>
          </View>
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}