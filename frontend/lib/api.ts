// API function to send chat messages to the backend

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000"; // default to localhost if not set

interface ChatMessage {
  role: string; // "user" or "assistant"
  content: string;
  tokens?: string[];
}


export const sendChatMessage = async (messages: ChatMessage[], topic: string) => {
  try {
    const response = await fetch(`${API_BASE}/chat`, { // backend URL
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages, topic: topic }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(`API error ${response.status}:`, errorData?.detail ?? response.statusText);
      return null;
    }
    
    return await response.json();

  } catch (error) {
    console.error("Error sending message:", error);
    return null;
  }

};