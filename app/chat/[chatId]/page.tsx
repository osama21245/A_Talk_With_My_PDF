import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
//import { checkSubscription } from "@/lib/subscription";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

interface Props {
  params: { chatId: string };
}

const ChatPage = async ({ params }: Props) => {
  const { chatId } = params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  if (!_chats || _chats.length === 0) {
    redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === Number(chatId));

  if (!currentChat) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0D1117]">
      <div className="flex w-full h-full overflow-hidden">
        {/* Chat Sidebar */}
        <div className="flex-[3] max-w-xs h-full overflow-y-auto bg-[#161B22] border-r border-[#00FF9D]/20">
          <ChatSideBar chats={_chats} chatId={Number(chatId)} />
        </div>
        {/* PDF Viewer */}
        <div className="flex-[5] p-4 overflow-y-auto bg-[#0D1117]">
          <PDFViewer pdf_url={currentChat.pdfUrl || ""} />
        </div>
        {/* Chat Component */}
        <div className="flex-[3] border-l border-[#00FF9D]/20 h-full overflow-y-auto bg-[#161B22]">
          <ChatComponent chatId={Number(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
