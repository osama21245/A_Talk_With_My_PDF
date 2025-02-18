import { NextResponse } from "next/server";
import { uploadToS3, getS3Url } from "@/lib/s3";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";

export const config = {
  api: {
    bodyParser: false, // Disable default body parser
  },
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "File is required" },
        { status: 400 }
      );
    }

    // Upload directly to S3 using streaming
    const { file_key, file_name } = await uploadToS3(file);

    // Create chat record
    const userId = formData.get("userId") as string;
    const chat = await db.insert(chats).values({
      pdfName: file_name,
      pdfUrl: getS3Url(file_key),
      fileKey: file_key,
      userId,
    }).returning();

    return NextResponse.json({ 
      success: true,
      chatId: chat[0].id,
      fileKey: file_key 
    });

  } catch (error) {
    console.error("Error in upload-and-create-chat:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
