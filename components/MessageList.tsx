import { Message } from "ai";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  messages: Message[];
  isLoading: boolean;
};

const MessageList = ({ messages, isLoading }: Props) => {
  if (isLoading) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Loader2 className="w-6 h-6 animate-spin text-[#00FF9D]" />
      </div>
    );
  }
  if (!messages) return <></>;
  return (
    <div className="flex flex-col gap-2 px-4 py-2 min-h-full">
      {messages.map((message) => {
        const isAssistant = message.role === "assistant" || message.role === "system";
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
                "rounded-lg px-3 text-sm py-1 shadow-md ring-1 ring-gray-900/10",
                {
                  "bg-[#1C2128] text-gray-100": message.role === "user",
                  "bg-[#161B22] border border-[#00FF9D]/20 text-[#00FF9D]": isAssistant,
                }
              )}
            >
              {(message as any).reasoning && (
                <pre className="text-xs text-[#00FF9D]/70 mb-2 whitespace-pre-wrap">
                  {(message as any).reasoning}
                </pre>
              )}
              <p>
                {typeof message.content === 'string' 
                  ? message.content 
                  : JSON.stringify(message.content)
                }
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;