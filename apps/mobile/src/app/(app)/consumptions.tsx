import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInUp,
} from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";

// Recuadro superior unificado
function KpiRow({
  reportType,
  setReportType,
}: {
  reportType: "Monthly" | "Yearly";
  setReportType: (t: "Monthly" | "Yearly") => void;
}) {
  return (
    // Recuadro exterior grande que contiene todas las secciones
    <Animated.View
      entering={FadeInDown.duration(400).springify()}
      className="w-full bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 p-3"
    >
      {/* Fila interior con las 5 secciones */}
      <View className="flex-row items-stretch gap-3">

        {/* SECCION 1: Total period (tamaño fijo pequeño) */}
        <View className="w-36 bg-white rounded-xl border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-gray-500">Total period</Text>
            <Text className="text-sm">💧</Text>
          </View>
          <Text className="text-xl font-bold text-[#0d1b2e]">
            1,245{" "}
            <Text className="text-xs font-normal text-gray-400">m³</Text>
          </Text>
        </View>

        {/* SECCION 2: Daily average (tamaño fijo pequeño) */}
        <View className="w-36 bg-white rounded-xl border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-gray-500">Daily average</Text>
            <Text className="text-sm">〰️</Text>
          </View>
          <Text className="text-xl font-bold text-[#0d1b2e]">
            41.5{" "}
            <Text className="text-xs font-normal text-gray-400">m³</Text>
          </Text>
        </View>

        {/* SECCION 3: Alerts (tamaño fijo pequeño) */}
        <View className="w-36 bg-white rounded-xl border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs text-gray-500">Alerts</Text>
            <Text className="text-sm">⚠️</Text>
          </View>
          {/* Número en rojo para destacar alertas activas */}
          <Text className="text-xl font-bold text-red-500">
            2{" "}
            <Text className="text-xs font-normal text-gray-400">active</Text>
          </Text>
        </View>

        {/* SECCION 4: Target vs. Actual (tamaño fijo pequeño) */}
        <View className="w-36 bg-white rounded-xl border border-gray-200 p-3">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-xs text-gray-500">Target vs. Actual</Text>
            <Text className="text-sm">📊</Text>
          </View>
          {/* Barra de progreso */}
          <View className="h-2 bg-gray-200 rounded-full mb-2">
            {/* w-3/4 = 75% del presupuesto usado */}
            <View className="h-2 bg-[#0d1b2e] rounded-full w-3/4" />
          </View>
          <Text className="text-xs font-semibold text-gray-600">
            75%{" "}
            <Text className="font-normal text-gray-400">budget used</Text>
          </Text>
          <Text className="text-xs text-gray-400 mt-0.5">1,245 / 1,660 m³</Text>
        </View>

        {/*  SECCION 5: Reports (ocupa todo el espacio restante) */}
        <View className="flex-1 bg-white rounded-xl border border-gray-200 p-3">
          {/* Encabezado con toggle Monthly / Yearly */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-xs font-semibold text-[#0d1b2e]">📄 Reports</Text>
            <View className="flex-row border border-gray-200 rounded-lg overflow-hidden">
              {(["Monthly", "Yearly"] as const).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setReportType(t)}
                  className={`px-3 py-1 ${reportType === t ? "bg-gray-100" : "bg-white"}`}
                >
                  <Text className="text-xs text-[#0d1b2e]">{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          {/* Botón de descarga ocupa todo el ancho de Reports */}
          <TouchableOpacity className="bg-[#0d1b2e] rounded-lg py-2 items-center">
            <Text className="text-white text-xs font-semibold">⬇ Download (.PDF)</Text>
          </TouchableOpacity>
        </View>

      </View>
    </Animated.View>
  );
}

// GRAFICA PLACEHOLDER (REEMPLAZAR ESTE COMPONENTE POR LAS COSAS DE LA API)
function LineChartPlaceholder() {
  const chartH = 200;
  const max = 330;

  return (
    <View style={{ height: chartH, position: "relative" }}>
      {/* Etiquetas del eje Y */}
      {[0, 100, 200, 300].map(v => (
        <View
          key={v}
          style={{
            position: "absolute",
            left: 0,
            bottom: (v / max) * chartH,
            flexDirection: "row",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Text className="text-xs text-gray-400 w-8">{v}</Text>
          {/* Línea guía horizontal */}
          <View style={{ flex: 1, height: 1, backgroundColor: "#e5e7eb" }} />
        </View>
      ))}

      {/* Texto indicador del placeholder */}
      <View className="flex-1 ml-8 items-end justify-end pb-4">
        <Text className="text-xs text-[#2089dc] font-semibold">
          📈 Integra Victory Native o React Native SVG Charts aquí
        </Text>
      </View>

      {/* Etiquetas del eje X */}
      <View className="flex-row justify-between ml-8 mt-1">
        {["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"].map(w => (
          <Text key={w} className="text-xs text-gray-400">{w}</Text>
        ))}
      </View>
    </View>
  );
}

// Historial de registros de los recibos pasados
interface RecordRowProps {
  date: string;
  value: string;
  status: "normal" | "high";
  delay: number;
}
function RecordRow({ date, value, status, delay }: RecordRowProps) {
  return (
    <Animated.View
      entering={FadeInUp.delay(delay).duration(350)}
      className="flex-row items-center justify-between py-4 border-b border-gray-100"
    >
      <View>
        {/* Fecha del registro */}
        <Text className="text-xs text-gray-400 mb-1">{date}</Text>
        {/* Valor de consumo */}
        <Text className="text-base font-bold text-[#0d1b2e]">{value} m³</Text>
      </View>

      {/* Badge de estado: verde = normal, rojo = alto */}
      <View
        className={`flex-row items-center gap-1 px-3 py-1 rounded-full ${
          status === "normal" ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <Text className="text-xs">
          {status === "normal" ? "✅" : "⚠️"}
        </Text>
        <Text
          className={`text-xs font-semibold ${
            status === "normal" ? "text-green-600" : "text-red-500"
          }`}
        >
          {status === "normal" ? "Normal usage" : "High usage"}
        </Text>
      </View>
    </Animated.View>
  );
}

// PANTALLA PRINCIPAL
export default function ConsumptionsScreen() {
  const [selectedBuilding, setSelectedBuilding] = useState("Main Complex");
  const [selectedPeriod, setSelectedPeriod] = useState<"Week" | "Month" | "Year">("Month");
  const [reportType, setReportType] = useState<"Monthly" | "Yearly">("Monthly");

  const historicalRecords = [
    { date: "Oct 24, 2024 • 08:00 AM", value: "12.5", status: "normal" as const },
    { date: "Oct 23, 2024 • 08:00 AM", value: "45.2", status: "high" as const },
    { date: "Oct 22, 2024 • 08:00 AM", value: "11.8", status: "normal" as const },
  ];

  return (
    // Fondo gris muy claro para toda la pantalla aquiii
    <SafeAreaView className="flex-1 bg-[#f8fafc]" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >

        {/* RECUADRO SUPERIOR: Recuadros unificados ── */}
        <KpiRow reportType={reportType} setReportType={setReportType} />

        {/* RECUADRO DE GRAFICA */}
        <Animated.View
          entering={FadeInDown.delay(200).duration(450).springify()}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm mb-4"
        >
          {/* Controles superiores de la gráfica */}
          <View className="flex-row items-center justify-between mb-4 flex-wrap gap-2">

            {/* Selector de edificio */}
            <View>
              <Text className="text-xs text-gray-400 mb-1">Selected Building</Text>
              <TouchableOpacity className="flex-row items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                <Text className="text-sm text-[#0d1b2e]">{selectedBuilding}</Text>
                <Text className="text-gray-400">▾</Text>
              </TouchableOpacity>
            </View>

            {/* Selector de periodo: Week / Month / Year
                El periodo seleccionado tiene fondo oscuro y texto blanco */}
            <View className="flex-row border border-gray-200 rounded-lg overflow-hidden">
              {(["Week", "Month", "Year"] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setSelectedPeriod(p)}
                  className={`px-4 py-2 ${selectedPeriod === p ? "bg-[#0d1b2e]" : "bg-white"}`}
                >
                  <Text className={`text-xs font-semibold ${selectedPeriod === p ? "text-white" : "text-[#0d1b2e]"}`}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Area de la gráfica */}
          <LineChartPlaceholder />

          {/* Botones debajo de la gráfica */}
          <View className="flex-row justify-center gap-3 mt-4">
            {/* Botón primario: agregar consumo */}
            <TouchableOpacity className="bg-[#0d1b2e] rounded-full px-5 py-2">
              <Text className="text-white text-sm font-semibold">+ Add consumption</Text>
            </TouchableOpacity>
            {/* Botón secundario: editar registros */}
            <TouchableOpacity className="bg-gray-100 rounded-full px-5 py-2 border border-gray-200">
              <Text className="text-[#0d1b2e] text-sm font-semibold">✏️ Edit records</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* RECUADRO DE HISTORIAL DE REFGISTROS */}
        <Animated.View
          entering={FadeInDown.delay(350).duration(400).springify()}
          className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm"
        >
          {/* Título con barra azul marino a la izquierda */}
          <View className="border-l-4 border-[#0d1b2e] pl-3 mb-3">
            <Text className="text-base font-bold text-[#0d1b2e]">Historical records</Text>
          </View>

          {/* Lista de registros */}
          {historicalRecords.map((r, i) => (
            <RecordRow
              key={i}
              date={r.date}
              value={r.value}
              status={r.status}
              delay={i * 80}
            />
          ))}
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}