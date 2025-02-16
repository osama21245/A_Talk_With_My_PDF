"use client";
import React, { useState } from "react";
import { useChat } from '@ai-sdk/react';
import { Button } from "@/components/ui/button";
import { Send, Loader2, Maximize2, Minimize2 } from "lucide-react";
import MessageList from "@/components/MessageList";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Message } from "ai";
import { Input } from "./ui/input";

type Props = { chatId: number };

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading: messagesLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });

  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSize = () => {
    const sidebar = document.querySelector('[data-component="sidebar"]');
    const pdfViewer = document.querySelector('[data-component="pdf-viewer"]');
    const chatComponent = document.querySelector('[data-component="chat-component"]');

    if (sidebar && pdfViewer && chatComponent) {
      if (isExpanded) {
        // Show sidebar and reset to original sizes
        sidebar.classList.remove('hidden');
        sidebar.classList.add('flex-[3]');
        pdfViewer.classList.remove('flex-[4]');
        pdfViewer.classList.add('flex-[5]');
        chatComponent.classList.remove('flex-[7]');
        chatComponent.classList.add('flex-[3]');
      } else {
        // Hide sidebar and expand other components
        sidebar.classList.add('hidden');
        pdfViewer.classList.remove('flex-[5]');
        pdfViewer.classList.add('flex-[4]');
        chatComponent.classList.remove('flex-[3]');
        chatComponent.classList.add('flex-[7]');
      }
      setIsExpanded(!isExpanded);
    }
  };

  const { messages, input, handleInputChange, handleSubmit, error } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
    onError: (error) => {
      console.error("Chat error:", error);
      setCustomError(error.message || "Failed to send message");
    },
    onFinish: async (message) => {
      try {
        await axios.post('/api/save-message', {
          chatId,
          content: message.content,
          role: "system"
        });
        setLoading(false);
        setCustomError(null);
      } catch (err) {
        console.error("Failed to save message:", err);
      }
    },
  });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setCustomError(null);
    try {
      await handleSubmit(event);
    } catch (err) {
      console.error("Submit error:", err);
      setCustomError(err instanceof Error ? err.message : "Failed to send message");
    }
  };

  React.useEffect(() => {
    const messageContainer = document.getElementById("message-container");
    if (messageContainer) {
      messageContainer.scrollTo({
        top: messageContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* header */}
      <div className="sticky top-0 inset-x-0 p-2 bg-[#161B22] border-b border-[#00FF9D]/20 flex justify-between items-center">
        <h3 className="text-xl font-bold text-[#00FF9D]">Chat</h3>
        <Button 
          onClick={toggleSize}
          variant="ghost" 
          className="hover:bg-[#1C2128] text-[#00FF9D]"
        >
          {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* message list */}
      <div className="flex-1 overflow-y-auto bg-[#0D1117]" id="message-container">
        <MessageList messages={messages} isLoading={messagesLoading} />
      </div>

      {/* error message */}
      {(error || customError) && (
        <div className="text-red-500 p-2 bg-[#161B22]/80">
          {customError || (error instanceof Error ? error.message : "An error occurred")}
        </div>
      )}

      {/* loading indicator */}
      {loading && (
        <div className="flex justify-center items-center p-2 bg-[#161B22]/80">
          <Loader2 className="animate-spin text-[#00FF9D]" />
          <span className="ml-2 text-[#00FF9D]">Sending message...</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="sticky bottom-0 inset-x-0 px-2 py-4 bg-[#161B22] border-t border-[#00FF9D]/20">
        <div className="flex">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask any question..."
            className="w-full bg-[#0D1117] border-[#00FF9D]/20 text-white focus:ring-[#00FF9D]/30"
          />
          <Button className="bg-gradient-to-r from-[#00FF9D] to-[#39FF14] hover:opacity-90 text-black ml-2" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;