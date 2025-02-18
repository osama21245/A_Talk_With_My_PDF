import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.NEXT_PUBLIC_S3_REGION!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  const { fileName} = await req.json();
  
  const fileKey = `uploads/${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
  const command = new PutObjectCommand({
    Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
    Key: fileKey,
    ContentType: 'application/pdf',
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return Response.json({ signedUrl, fileKey });
} 