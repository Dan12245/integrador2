import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInLeft,
  SlideInUp,
} from "react-native-reanimated";
import AppNavbar from "../../components/AppNavbar";

interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "bot";
}

interface HelpCardProps {
  title: string;
  description: string;
  delay: number;
}

// TARJETA FAQ / CONTACT US
// · flex-1 -> hace que cada tarjeta ocupa el mismo espacio
// · p-6    -> padding interno espacioso
function HelpCard({ title, description, delay }: HelpCardProps) {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(400).springify()}
      className="flex-1 bg-white rounded-3xl p-6"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Título de la tarjeta */}
      <Text className="text-xl font-black text-[#0d1b2e] text-center mb-3">
        {title}
      </Text>

      {/* Línea separadora */}
      <View className="h-[1.5px] bg-[#0d1b2e] mb-4" />

      {/* Descripción */}
      <Text className="text-sm text-[#0d1b2e]/60 text-center leading-5">
        {description}
      </Text>
    </Animated.View>
  );
}

// ─── PANTALLA PRINCIPAL: Tech Support ────────────────────────────────────────
export default function TechSupport() {
  const [searchQuery, setSearchQuery] = useState("");
  const [chatInput, setChatInput]     = useState("");
  const [messages, setMessages]       = useState<ChatMessage[]>([
    { id: "1", text: "I NEED HELP",                                      sender: "user" },
    { id: "2", text: "Blah blah I'm a bot bleh bleh I'm a placeholder", sender: "bot"  },
    { id: "3", text: "What is brochacho talking about",                  sender: "user" },
  ]);

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      text: chatInput.trim(),
      sender: "user",
    }]);
    setChatInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "Thanks for reaching out! A support agent will assist you shortly.",
        sender: "bot",
      }]);
    }, 800);
  };

  const helpCards = [
    {
      title: "FAQ",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor maecenas fe",
    },
    {
      title: "Contact Us",
      description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tortor maecenas fe",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right", "bottom"]}>
      <AppNavbar />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

          {/*  LAYOUT PRINCIPAL: columna izquierda + chatbot derecho */}
          <View className="flex-row flex-1">

            {/*  COLUMNA IZQUIERDA (Hero + tarjetas) */}
            <View className="flex-1">

              {/* HERO OSCURO
                  · px-10 pt-12 pb-20 -> padding */}
              <View className="bg-[#0d1b2e] px-10 pt-12 pb-20">

                {/* TITULO PRINCIPAL
                    · color blanco forzado con style para garantizar
                      que se vea blanco tanto en web como en móvil pq sino se camufla con el fondo*/}
                <Animated.Text
                  entering={FadeInLeft.duration(500).springify()}
                  style={{ fontSize: 52, color: "#ffffff" }}
                  className="font-black leading-tight mb-10"
                >
                  {"How can we\nhelp?"}
                </Animated.Text>

                {/* BARRA DE BÚSQUEDA
                    · rounded-full  -> completamente ovalada pq se ve más bonito  y es acorde al Foigma
                    · bg-white      -> fondo blanco sobre el hero oscuro
                    · borderWidth 2 -> con este nivel de ancho deja visivle el contorno */}
                <Animated.View
                  entering={FadeInDown.delay(150).duration(450).springify()}
                  className="flex-row items-center bg-white rounded-full px-6 py-4 gap-3"
                  style={{
                    maxWidth: 680,
                    borderWidth: 2,
                    borderColor: "#7ab8d9",
                  }}
                >
                  {/* LUPA (o sea, el ícono que está en la barra de búsqueda) */}
                  <Text className="text-gray-400 text-xl">🔍</Text>

                  {/* Campo de texto */}
                  <TextInput
                    className="flex-1 text-base text-gray-700"
                    placeholder="Search your issue here"
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </Animated.View>
              </View>

              {/* SECCION DE TARJETAS FaQ / CONTACT US
                  · p-6 -> padding para que las tarjetas no toquen los bordes */}
              <Animated.View
                entering={FadeInLeft.delay(200).duration(450).springify()}
                className="bg-[#daedf7] p-6"
              >
                {/* RECUADRO EXTERIOR que envuelve las 2 tarjetas */}
                <View
                  className="rounded-3xl p-4"
                  style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
                >
                  {/* Fila de tarjetas con espacio entre ellas */}
                  <View className="flex-row gap-4">
                    {helpCards.map((card, i) => (
                      <HelpCard
                        key={i}
                        title={card.title}
                        description={card.description}
                        delay={i * 100}
                      />
                    ))}
                  </View>
                </View>
              </Animated.View>

            </View>

            {/* RECUADRO DEL CHATBOT (columna derecha)
                · w-80 -> ancho fijo
                · margin 16 -> para darle un espaciado bonito */}
            <Animated.View
              entering={FadeInRight.delay(250).duration(450).springify()}
              className="w-80 bg-white flex-col"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: -2, height: 0 },
                shadowOpacity: 0.08,
                shadowRadius: 12,
                elevation: 6,
                borderRadius: 20,
                margin: 16,
                overflow: "hidden",
              }}
            >
              {/* HEADER azul del chatbot */}
              <View className="bg-[#2089dc] px-4 py-5 items-center rounded-t-2xl">
                <Text className="text-white text-lg font-black">Help bot</Text>
              </View>

              {/* AREA DE MENSAJES */}
              <FlatList
                data={messages}
                keyExtractor={m => m.id}
                className="flex-1 px-3 py-3"
                style={{ minHeight: 280 }}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item, index }) => (
                  <Animated.View
                    entering={SlideInUp.delay(index * 60).duration(300)}
                    className={`max-w-[78%] px-4 py-3 ${
                      item.sender === "user"
                        ? "self-end bg-gray-200 rounded-2xl rounded-br-sm"
                        : "self-start bg-blue-100 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    <Text className="text-sm text-[#0d1b2e]">{item.text}</Text>
                  </Animated.View>
                )}
              />

              {/* INPUT DEL CHAT */}
              <View className="flex-row items-center border-t border-gray-100 px-4 py-3 gap-2 rounded-b-2xl">
                <TextInput
                  className="flex-1 text-sm text-gray-700 py-1"
                  placeholder="Type here..."
                  placeholderTextColor="#9ca3af"
                  value={chatInput}
                  onChangeText={setChatInput}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />
                <TouchableOpacity className="p-1">
                  <Text className="text-gray-400 text-lg">📎</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={sendMessage} className="p-1">
                  <Text className="text-[#2089dc] text-xl">➤</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}