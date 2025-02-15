"use client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { PlusCircle, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#00FF9D]/20">
        <Link href="/">
          <Button className="w-full bg-gradient-to-r from-[#00FF9D] to-[#39FF14] hover:opacity-90 text-black">
            <PlusCircle className="mr-2 w-4 h-4" />
            New Chat
          </Button>
        </Link>
      </div>

      <div className="flex-1 overflow-auto">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn("flex items-center gap-2 p-4 hover:bg-[#1C2128] transition-colors duration-200", {
                "bg-[#1C2128] text-[#00FF9D] border-r-2 border-[#00FF9D]": chat.id === chatId,
                "text-gray-300": chat.id !== chatId,
              })}
            >
              <MessageSquare className="w-4 h-4" />
              <p className="truncate text-sm">
                {chat.pdfName}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatSideBar;