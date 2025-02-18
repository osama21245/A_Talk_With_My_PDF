import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export const POST = async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { fileName, fileContent } = await req.json();

    if (!fileName || !fileContent) {
      return new Response(JSON.stringify({ error: 'Missing file data' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
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
      body: Buffer.from(fileContent, 'base64'),
      headers: {
        'Content-Type': 'application/pdf',
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }

    return new Response(JSON.stringify({ fileKey }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in upload-and-create-chat:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
