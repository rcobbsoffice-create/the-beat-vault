import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure R2 client (Cloudflare R2 is S3-compatible)
// HARDCODED CREDENTIALS FOR IMMEDIATE FIX (Env vars not exposing to client)
const r2Client = new S3Client({
  region: 'auto',
  endpoint: 'https://118d3f495ee79c8de7fe0a297e16b33d.r2.cloudflarestorage.com',
  credentials: {
    accessKeyId: '877bd7c15a4e9cffaec2923635430ca9',
    secretAccessKey: '3bd2d5589c36037b3ec1acbdbc4e70ad8426463766ca0bae721150202d71d3df',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = 'beatvault';

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
  const publicUrl = 'https://pub-42ddce115e0f4aa28de06c4abaeed76a.r2.dev';
  return `${publicUrl}/${key}`;
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
