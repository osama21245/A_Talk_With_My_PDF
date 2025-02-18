// import { deepseek } from '@ai-sdk/deepseek';
import { Message, streamText } from 'ai';
import { db } from "@/lib/db";
import { chats, messages as _messages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getContext } from "@/lib/context";
import { google } from '@ai-sdk/google';

// Allow responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Add CORS headers
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });

    if (req.method === 'OPTIONS') {
      return new Response(null, { headers });
    }

    const { messages, chatId } = await req.json();
    const _chats = await db.select().from(chats).where(eq(chats.id, chatId));
    if (_chats.length !== 1) {
      return NextResponse.json({ error: "chat not found" }, { status: 404 });
    }

    const fileKey = _chats[0].fileKey;
    const context = await getContext(messages[messages.length - 1].content, fileKey);

    const prompt = {
      role: "system",
      content: `You are an intelligent and helpful AI assistant with extensive knowledge across many fields.

      When responding to questions, format your answers as follows:

      1. **PDF Content Section**:
         - Start with "📄 From the PDF content:"
         - Present information in clear paragraphs
         - For lists, keep points on the same line separated by • 
         - End each major point with a period and new line
         - If not in PDF, state "📄 This topic is not covered in the PDF content."

      2. **Additional Knowledge Section** (after two newlines):
         - Start with "💡 Additional Information:"
         - Present main ideas in clear paragraphs.
         - For related points, use format: Main point • Related point • Another point.
         - Each new concept starts on a new line.
         - Use bullet points only for distinct categories.

      3. **Examples Section** (after two newlines):
         - Start with "🔍 Examples and Applications:"
         - Format examples as: "Example: [description]"
         - Related examples on same line separated by •
         - Each category of examples on new line.

      Format Example:
      📄 From the PDF content:
      The main concept is explained here in a clear paragraph.
      Key points: First point • Second point • Third point.
      Additional details in a new paragraph.

      💡 Additional Information:
      The broader context is explained in this paragraph.
      Related concepts: Concept A • Concept B • Concept C.
      New topic starts on this line with its own explanation.

      🔍 Examples and Applications:
      Historical examples: Example 1 • Example 2 • Example 3.
      Modern applications: Application A • Application B.

      PDF CONTEXT BLOCK:
      ${context}
      END OF CONTEXT BLOCK

      IMPORTANT: Maintain this formatting structure. Use periods for complete thoughts, bullets (•) for related points on the same line, and new lines for new concepts.`,
    };

    //gemini-1.5-flash-latest
    const result = streamText({
      model: google('gemini-1.5-flash-latest'),
      messages: [
        prompt,
        ...messages.filter((message: Message) => message.role === "user"),
      ],
    });

    // const result = streamText({
    //   model: deepseek('deepseek-reasoner'),
    //   messages: [
    //     prompt,
    //     ...messages.filter((message: Message) => message.role === "user"),
    //   ],
    // });

    // Save user message into db
    await db.insert(_messages).values({
      chatId,
      content: messages[messages.length - 1].content,
      role: "user",
    });

    // Handle the stream and save AI message
    //const response = result.toDataStreamResponse()

    const reponse2 = result.toTextStreamResponse()
    const completion = await reponse2.text();
    await db.insert(_messages).values({
      chatId,
      content: completion,
      role: "system",
    });
    

    return new Response(completion, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}