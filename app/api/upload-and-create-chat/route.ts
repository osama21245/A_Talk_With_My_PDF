import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '50mb'
    }
  }
};

export async function POST(req: NextRequest) {
  if (req.method !== 'POST') {
    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 413 }
      );
    }

    const fileName = file.name;
    const fileContent = await file.arrayBuffer();

    if (!fileName || !fileContent) {
      return NextResponse.json(
        { error: 'Missing file data' },
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      Key: fileKey,
      ContentType: 'application/pdf', // Assuming PDF files
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    const uploadResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: Buffer.from(fileContent),
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    return NextResponse.json(
      { fileKey },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in upload-and-create-chat:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
