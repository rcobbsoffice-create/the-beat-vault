import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client (Cloudflare R2 is S3-compatible)
// IMPORTANT: These credentials should ONLY be used server-side (Edge Functions)
// Never expose these in client-side code

const R2_ENDPOINT = process.env.R2_ENDPOINT || process.env.EXPO_PUBLIC_R2_ENDPOINT || '';
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID || process.env.EXPO_PUBLIC_R2_ACCESS_KEY_ID || '';
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY || process.env.EXPO_PUBLIC_R2_SECRET_ACCESS_KEY || '';
const BUCKET_NAME = process.env.R2_BUCKET_NAME || process.env.EXPO_PUBLIC_R2_BUCKET_NAME || 'beatvault';

// Only initialize if credentials are available
const r2Client = R2_ACCESS_KEY && R2_SECRET_KEY ? new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
  forcePathStyle: true,
}) : null;

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  if (!r2Client) {
    throw new Error('R2 client not configured. Please set R2 environment variables.');
  }

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL from environment or default
  const publicUrl = process.env.R2_PUBLIC_URL || process.env.EXPO_PUBLIC_R2_PUBLIC_URL || 'https://pub-42ddce115e0f4aa28de06c4abaeed76a.r2.dev';
  return `${publicUrl}/${key}`;
}

/**
 * Generate a presigned download URL (valid for 1 hour)
 */
export async function generateDownloadUrl(key: string): Promise<string> {
  if (!r2Client) {
    throw new Error('R2 client not configured. Please set R2 environment variables.');
  }

  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}

/**
 * Delete a file from R2
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!r2Client) {
    throw new Error('R2 client not configured. Please set R2 environment variables.');
  }

  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
}

/**
 * Generate beat file paths
 */
export function getBeatFilePaths(beatId: string) {
  return {
    original: `beats/${beatId}/original.wav`,
    preview: `beats/${beatId}/preview.mp3`,
    artwork: `beats/${beatId}/artwork.jpg`,
    stems: {
      drums: `beats/${beatId}/stems/drums.wav`,
      melody: `beats/${beatId}/stems/melody.wav`,
      bass: `beats/${beatId}/stems/bass.wav`,
      other: `beats/${beatId}/stems/other.wav`,
    },
  };
}
