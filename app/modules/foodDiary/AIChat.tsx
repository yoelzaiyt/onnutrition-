"use client";

import React, { useState } from "react";
import {
  processMessage,
  ChatMessage,
  getSuggestions,
  sendWhatsAppMessage,
} from "@/app/lib/aiChat";
import {
  MessageCircle,
  Send,
  Sparkles,
  Phone,
  X,
  Lightbulb,
} from "lucide-react";

interface AIChatProps {
  userProfile?: {
    name?: string;
    weight?: number;
    goal?: "lose_weight" | "maintain" | "gain_weight" | "muscle";
  };
}

export default function AIChat({ userProfile }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = processMessage(userMessage.content, userProfile);
      setTimeout(() => {
        setMessages((prev) => [...prev, response]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error processing message:", error);
      setIsLoading(false);
    }
  };

  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  const handleWhatsApp = () => {
    const phone = "5511953992662";
    const message =
      messages.length > 0
        ? `Olá! Gostaria de conversar sobre: ${messages[messages.length - 1].content.substring(0, 100)}...`
        : "Olá! Gostaria de saber mais sobre alimentação saudável.";

    sendWhatsAppMessage(message, phone);
  };

  const handleClose = () => {
    setIsOpen(false);
    setMessages([]);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-[#22B391] to-[#0B2B24] rounded-full flex items-center justify-center shadow-lg shadow-[#22B391]/30 hover:scale-110 transition-transform z-50"
      >
        <Sparkles className="w-6 h-6 text-white" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-100 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#22B391] to-[#0B2B24] p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold">Assistente Nutricional</h3>
            <p className="text-white/60 text-xs">Baseado na TACO</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleWhatsApp}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
            title="Enviar WhatsApp"
          >
            <Phone className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={handleClose}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#22B391]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-[#22B391]" />
            </div>
            <p className="text-slate-600 text-sm mb-4">
              Olá! Sou seu assistente nutricional. Posso ajudar com receitas,
              dúvidas sobre alimentos e sugestões saudáveis!
            </p>
            <div className="grid grid-cols-2 gap-2">
              {getSuggestions()
                .slice(0, 4)
                .map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(suggestion)}
                    className="text-left text-xs p-2 bg-slate-50 rounded-lg hover:bg-[#22B391]/10 hover:text-[#22B391] transition-colors"
                  >
                    <Lightbulb className="w-3 h-3 inline mr-1" />
                    {suggestion}
                  </button>
                ))}
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                message.role === "user"
                  ? "bg-[#22B391] text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-3 rounded-2xl">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-[#22B391] rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-[#22B391] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-[#22B391] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Digite sua dúvida..."
            className="flex-1 p-3 bg-slate-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#22B391]"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-[#22B391] text-white rounded-xl hover:bg-[#1a9580] transition-colors disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
