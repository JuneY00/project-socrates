// API function to send chat messages to the backend

// Define the base URL for the API, using an environment variable or defaulting to localhost
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"; // default to localhost if not set

type messageRole = "user" | "assistant";

interface ChatResponse {
  reply: string; // The AI-generated reply
  tokens: string[]; // The tokens used in the reply
}

interface ChatRequest {
  messages: ChatMessage[]; // The conversation history to send to the backend
  topic: string; // The topic of the conversation for context
}

interface ChatMessage {
  role: messageRole; // "user" for user messages, "assistant" for AI responses
  content: string; // The actual message content
  tokens?: string[]; // Optional: tokenized content for more efficient processing
}

export const sendChatMessage = async (messages: ChatMessage[], topic: string): Promise<ChatResponse | null> => {

  try {
    const response = await fetch(`${API_BASE}/chat`, { // backend URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`API error ${response.status}:`, errorData?.detail ?? response.statusText);
      return null;
    }

    const data: ChatResponse = await response.json();
    return data;

  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }

};