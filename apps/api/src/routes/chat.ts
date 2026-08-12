import { Hono } from "hono";
import { streamText } from "hono/streaming";
import { GoogleGenAI } from "@google/genai";

type Bindings = {
    GEMINI_API_KEY: string;
};

const chatRouter = new Hono<{ Bindings: Bindings }>();

chatRouter.post("/chat", async (c) => {
    try {
        const apiKey = c.env.GEMINI_API_KEY;
        if (!apiKey) {
            return c.json({ error: "Server configuration error: GEMINI_API_KEY is missing" }, 500);
        }

        const body = await c.req.json();
        const messages: { role: "user" | "model"; content: string }[] = body.messages || [];

        if (!messages || messages.length === 0) {
            return c.json({ error: "No messages provided" }, 400);
        }

        const ai = new GoogleGenAI({ apiKey });

        // Format messages for Gemini API
        const contents = messages.map((msg) => ({
            role: msg.role === "model" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const responseStream = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                systemInstruction: `You are a helpful, friendly AI Assistant embedded in an Water Consumption and Building Management application.
Your role is to assist users with:
- App navigation (My Buildings, Consumptions, User Profile, Tech Support).
- Uploading utility receipts and tracking consumption.
- General questions regarding energy efficiency and app feature support.

Keep your answers concise, friendly, clear, and well-structured. Avoid overly long explanations unless requested.
Avoid using symbols such as asterisks '*' to format text. Use simple hyphens '-' for lists`,
            },
        });

        return streamText(c, async (stream) => {
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    await stream.write(chunk.text);
                }
            }
        });
    } catch (error: any) {
        console.error("Error in Gemini Chat route:", error);
        return c.json(
            { error: "Internal AI processing error", details: error?.message || String(error) },
            500,
        );
    }
});

export default chatRouter;
