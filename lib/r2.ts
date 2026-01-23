import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client (Cloudflare R2 is S3-compatible)
// Fallbacks for build time validation
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID || 'placeholder'}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || 'placeholder',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || 'placeholder',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'beats';

/**
 * Upload a file to R2
 */
export async function uploadToR2(
  key: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);

  // Return public URL
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

/**
 * Generate a presigned download URL (valid for 1 hour)
 */
export async function generateDownloadUrl(key: string): Promise<string> {
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
