import { Message } from "ai";
import { Loader2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "./ui/button";

type Props = {
  messages: Message[];
  isLoading: boolean;
};

interface ExtendedMessage extends Message {
  reasoning?: string;
}

const MessageList = ({ messages, isLoading }: Props) => {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin text-[#00FF9D]" />
      </div>
    );
  }
  if (!messages) return <></>;

  const renderContent = (content: string) => {
    return content.split('\n\n').map((section, index) => (
      <div key={index} className="mb-4">
        {section.split('\n').map((line, idx) => (
          <p key={idx} className="mb-1">{line}</p>
        ))}
      </div>
    ));
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-2 min-h-full">
      {messages.map((message) => {
        const extendedMessage = message as ExtendedMessage;
        const isAssistant = message.role === "assistant" || message.role === "system";
        const isCopied = copiedMessageId === message.id;

        return (
          <div
            key={message.id}
            className={cn("flex", {
              "justify-end pl-10": message.role === "user",
              "justify-start pr-10": isAssistant,
            })}
          >
            <div
              className={cn(
                "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10 relative group",
                {
                  "bg-[#1C2128] text-gray-100": message.role === "user",
                  "bg-[#1A2333] border border-[#2D4F67]/20 text-[#E2E8F0]": isAssistant,
                }
              )}
            >
              {isAssistant && (
                <Button
                  onClick={() => handleCopy(message.content, message.id)}
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#2D4F67]/20"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 text-[#94A3B8]" />
                  )}
                </Button>
              )}
              {extendedMessage.reasoning && (
                <pre className="text-xs text-[#94A3B8] mb-2 whitespace-pre-wrap">
                  {extendedMessage.reasoning}
                </pre>
              )}
              {renderContent(message.content)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;