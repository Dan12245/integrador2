import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    ScrollView,
    ActivityIndicator,
    Modal,
    Platform,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { getApiUrl } from "@/src/lib/api";
import { useTranslation } from "react-i18next";

export interface Message {
    id: string;
    role: "user" | "model";
    content: string;
}

export default function AIChatBubble() {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial-welcome",
            role: "model",
            content: "",
        },
    ]);
    const [isStreaming, setIsStreaming] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const handleClearChat = () => {
        setMessages([
            {
                id: `welcome-${Date.now()}`,
                role: "model",
                content: "",
            },
        ]);
    };

    const handleSendMessage = async () => {
        const userText = input.trim();
        if (!userText || isStreaming) return;

        const userMessage: Message = {
            id: `user-${Date.now()}`,
            role: "user",
            content: userText,
        };

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("");
        setIsStreaming(true);

        const botMessageId = `bot-${Date.now()}`;
        const initialBotMessage: Message = {
            id: botMessageId,
            role: "model",
            content: "",
        };

        setMessages([...newMessages, initialBotMessage]);

        try {
            // Send history (excluding initial static welcome message if desired, or mapping to role format)
            const apiMessages = newMessages
                .filter((m) => m.id !== "initial-welcome" && !m.id.startsWith("welcome-"))
                .map((m) => ({
                    role: m.role,
                    content: m.content,
                }));

            // Fallback if filtering removed everything
            const payload =
                apiMessages.length > 0 ? apiMessages : [{ role: "user", content: userText }];

            const response = await fetch(`${getApiUrl()}/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ messages: payload }),
            });

            if (!response.ok) {
                throw new Error(`API response error: ${response.status}`);
            }

            if (response.body && typeof response.body.getReader === "function") {
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let accumulatedText = "";

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;

                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === botMessageId ? { ...msg, content: accumulatedText } : msg,
                        ),
                    );
                }
            } else {
                // Fallback for environments where response.body.getReader is not available
                const fullText = await response.text();
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === botMessageId ? { ...msg, content: fullText } : msg,
                    ),
                );
            }
        } catch (error: any) {
            console.error("AI Chat Stream Error:", error);
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === botMessageId
                        ? {
                              ...msg,
                              id: `error-${msg.id}`,
                              content: "",
                          }
                        : msg,
                ),
            );
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <>
            {/* Floating Action Button (FAB) */}
            <View
                style={{
                    position: "absolute",
                    bottom: 24,
                    right: 20,
                    zIndex: 9999,
                }}
            >
                <TouchableOpacity
                    testID="ai-chat-fab-button"
                    onPress={() => setIsOpen(!isOpen)}
                    activeOpacity={0.85}
                    className="bg-sky-600 rounded-full w-14 h-14 items-center justify-center shadow-lg border border-sky-400 flex-row"
                >
                    <Feather name={isOpen ? "x" : "message-square"} size={26} color="#FFFFFF" />
                </TouchableOpacity>
            </View>

            {/* Floating Chat Modal Popup */}
            <Modal
                visible={isOpen}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsOpen(false)}
            >
                <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                    <View className="flex-1 justify-end items-end p-4 md:p-6 bg-black/30">
                        <View className="bg-white w-full max-w-md h-[520px] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex-1 flex-col max-h-[85vh]">
                            {/* Header */}
                            <View className="bg-sky-600 p-4 flex-row items-center justify-between">
                                <View className="flex-row items-center space-x-2">
                                    <View className="bg-white/20 p-2 rounded-xl mr-2">
                                        <MaterialCommunityIcons
                                            name="robot"
                                            size={20}
                                            color="#FFFFFF"
                                        />
                                    </View>
                                    <View>
                                        <Text className="text-white font-bold text-base">
                                            {t('chatbot.title')}
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row items-center space-x-1">
                                    <TouchableOpacity
                                        testID="ai-chat-clear-button"
                                        onPress={handleClearChat}
                                        className="p-2 rounded-lg bg-white/10 active:bg-white/20 mr-1"
                                    >
                                        <Feather name="trash-2" size={18} color="#FFFFFF" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        testID="ai-chat-close-button"
                                        onPress={() => setIsOpen(false)}
                                        className="p-2 rounded-lg bg-white/10 active:bg-white/20"
                                    >
                                        <Feather name="x" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Message History List */}
                            <ScrollView
                                ref={scrollViewRef}
                                onContentSizeChange={() =>
                                    scrollViewRef.current?.scrollToEnd({ animated: true })
                                }
                                className="flex-1 p-4 bg-gray-50"
                                contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
                            >
                                {messages.map((msg) => {
                                    const isUser = msg.role === "user";
                                    return (
                                        <View
                                            key={msg.id}
                                            className={`my-1.5 flex-row ${isUser ? "justify-end" : "justify-start"}`}
                                        >
                                            <View
                                                className={`max-w-[82%] px-4 py-3 rounded-2xl ${
                                                    isUser
                                                        ? "bg-sky-600 rounded-br-none"
                                                        : "bg-white border border-gray-200 rounded-bl-none shadow-sm"
                                                }`}
                                            >
                                                <Text
                                                    className={`text-sm leading-5 ${
                                                        isUser
                                                            ? "text-white font-medium"
                                                            : "text-gray-800 font-normal"
                                                    }`}
                                                >
                                                    {msg.id === "initial-welcome"
                                                        ? t('chatbot.initial')
                                                        : msg.id.startsWith("welcome-")
                                                            ? t('chatbot.reset')
                                                            : msg.id.startsWith("error-")
                                                                ? t('chatbot.error')
                                                                : msg.content ||
                                                                  (isStreaming && !isUser
                                                                      ? t('chatbot.thinking')
                                                                      : "")}
                                                </Text>
                                            </View>
                                        </View>
                                    );
                                })}

                                {isStreaming && (
                                    <View className="flex-row items-center space-x-2 my-2 bg-gray-100 p-2.5 rounded-xl self-start">
                                        <ActivityIndicator size="small" color="#0284c7" />
                                        <Text className="text-xs text-gray-500 font-medium ml-1">
                                            {t('chatbot.responding')}
                                        </Text>
                                    </View>
                                )}
                            </ScrollView>

                            {/* Input Bar */}
                            <View className="p-3 bg-white border-t border-gray-100 flex-row items-center space-x-2">
                                <TextInput
                                    testID="ai-chat-input"
                                    value={input}
                                    onChangeText={setInput}
                                    placeholder={t('chatbot.placeholder')}
                                    placeholderTextColor="#9CA3AF"
                                    onSubmitEditing={handleSendMessage}
                                    returnKeyType="send"
                                    editable={!isStreaming}
                                    className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 mr-2"
                                />

                                <TouchableOpacity
                                    testID="ai-chat-send-button"
                                    onPress={handleSendMessage}
                                    disabled={isStreaming || !input.trim()}
                                    className={`w-11 h-11 rounded-xl items-center justify-center ${
                                        input.trim() && !isStreaming ? "bg-sky-600" : "bg-gray-200"
                                    }`}
                                >
                                    <Feather
                                        name="send"
                                        size={18}
                                        color={input.trim() && !isStreaming ? "#FFFFFF" : "#9CA3AF"}
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </>
    );
}
