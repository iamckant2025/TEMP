import { useState, useEffect, useRef } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
        conversation_id: conversationId
      });

      if (!conversationId) {
        setConversationId(response.data.conversation_id);
      }

      const aiMessage = {
        role: "assistant",
        content: response.data.message,
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div className="hidden md:flex w-[280px] flex-col border-r border-white/10 bg-black/50 backdrop-blur-xl relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5 mix-blend-overlay"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1667660664335-f026a2614577?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwxfHxicnVzaGVkJTIwc3RlZWwlMjB0ZXh0dXJlJTIwbWV0YWx8ZW58MHx8fHwxNzY0NTcwNzk3fDA&ixlib=rb-4.1.0&q=85')",
            backgroundSize: 'cover'
          }}
        />
        <div className="relative z-10 p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-2xl font-heading font-bold chrome-text">CKAI</h1>
          </div>
          
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground/70 mb-4">Conversations</p>
            {conversationId && (
              <div className="p-3 rounded-md bg-white/5 border border-white/10 text-sm text-neutral-400 hover:bg-white/10 transition-all duration-300 cursor-pointer" data-testid="current-conversation">
                Current Chat
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {/* Background */}
        {messages.length === 0 && (
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1759179075678-d65678f1050e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzZ8MHwxfHNlYXJjaHwxfHxsaXF1aWQlMjBjaHJvbWUlMjBhYnN0cmFjdCUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzY0NTcwNzk2fDA&ixlib=rb-4.1.0&q=85')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="absolute inset-0 bg-black/80" />
          </div>
        )}

        {/* Messages Area */}
        <ScrollArea className="flex-1 relative z-10" ref={scrollRef} data-testid="chat-messages-area">
          <div className="max-w-4xl mx-auto p-6 md:p-12">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center" data-testid="welcome-screen">
                <div className="w-20 h-20 rounded-full bg-white/5 backdrop-blur-md border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                  <Bot className="w-10 h-10 text-white" strokeWidth={1} />
                </div>
                <h2 className="text-5xl md:text-7xl font-bold font-heading tracking-tighter chrome-text mb-4">
                  CKAI Assistant
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground max-w-md">
                  Your intelligent AI companion. Ask me anything and I'll help you with precision and clarity.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 items-start ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.role}-${idx}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-6 py-3 ${
                        msg.role === 'user'
                          ? 'bg-white text-black rounded-2xl rounded-tr-sm shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                          : 'bg-white/5 border border-white/10 text-white rounded-2xl rounded-tl-sm backdrop-blur-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-body">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        <User className="w-4 h-4" strokeWidth={2} />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-4 items-start" data-testid="loading-indicator">
                    <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm backdrop-blur-md px-6 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-xl p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask me anything..."
                className="min-h-[60px] max-h-[200px] bg-neutral-900/50 border border-white/10 focus:border-white/40 focus:ring-0 rounded-2xl px-6 py-4 text-white placeholder:text-neutral-600 backdrop-blur-xl resize-none font-body shadow-inner"
                disabled={isLoading}
                data-testid="chat-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-white text-black hover:bg-neutral-200 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 disabled:opacity-50 disabled:shadow-none"
                data-testid="send-button"
              >
                <Send className="w-5 h-5" strokeWidth={2} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ChatInterface />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
