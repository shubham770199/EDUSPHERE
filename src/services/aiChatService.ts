import api from "./api";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiChatService = {
  // Send a message + recent history; returns the assistant's reply.
  send: async (message: string, history: AiMessage[] = []): Promise<string> => {
    const { data } = await api.post("/chat", { message, history });
    return data.reply as string;
  },
};
