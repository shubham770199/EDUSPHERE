import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Minimize2, X, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { aiChatService, AiMessage } from "@/services/aiChatService";

interface ChatMessage extends AiMessage {
  id: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "Explain binary search trees simply",
  "Give me tips to improve my attendance",
  "How do I submit an assignment?",
  "Summarize Newton's three laws",
];

const ChatBot = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist a short history per user so the conversation survives refreshes.
  const storeKey = user ? `edu_ai_chat_${user.id}` : "";

  useEffect(() => {
    if (!storeKey) return;
    const saved = localStorage.getItem(storeKey);
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch {
        /* ignore */
      }
    }
  }, [storeKey]);

  useEffect(() => {
    if (storeKey) localStorage.setItem(storeKey, JSON.stringify(messages.slice(-30)));
  }, [messages, storeKey]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  // Only show the assistant to logged-in users (the API requires auth).
  if (!isAuthenticated) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = { id: `u_${Date.now()}`, role: "user", content: trimmed, timestamp: Date.now() };
    const history: AiMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const reply = await aiChatService.send(trimmed, history);
      setMessages((prev) => [...prev, { id: `a_${Date.now()}`, role: "assistant", content: reply, timestamp: Date.now() }]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "The assistant is unavailable right now.";
      setMessages((prev) => [...prev, { id: `e_${Date.now()}`, role: "assistant", content: `⚠️ ${msg}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setMessages([]);
    if (storeKey) localStorage.removeItem(storeKey);
  };

  // Floating launcher
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-primary text-white shadow-elevated hover:scale-110 transition-transform flex items-center justify-center z-40"
        title="AI Study Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-40">
        <Card className="w-64 shadow-elevated">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> AI Assistant
              </CardTitle>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsMinimized(false)}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Card className="w-[22rem] sm:w-96 h-[70vh] sm:h-[600px] shadow-2xl flex flex-col">
        <CardHeader className="border-b pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Study Assistant
            </CardTitle>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsMinimized(true)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Powered by OpenAI • ask me anything about your studies</p>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-6 space-y-4">
                  <Sparkles className="h-10 w-10 text-primary mx-auto opacity-60" />
                  <p className="text-sm text-muted-foreground">
                    Hi {user?.name?.split(" ")[0] || "there"}! I'm your AI study assistant. Try one of these:
                  </p>
                  <div className="flex flex-col gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="text-xs text-left rounded-lg border px-3 py-2 hover:bg-muted/60 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted px-4 py-3 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-current rounded-full animate-bounce opacity-60" />
                      <span className="h-2 w-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "0.15s" }} />
                      <span className="h-2 w-2 bg-current rounded-full animate-bounce opacity-60" style={{ animationDelay: "0.3s" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="border-t p-3 space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Ask a study question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                disabled={loading}
              />
              <Button size="icon" onClick={() => send(input)} disabled={loading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            {messages.length > 0 && (
              <Button size="sm" variant="ghost" onClick={clear} className="w-full text-xs h-7">
                Clear chat
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatBot;
