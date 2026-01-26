import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createServiceClient } from '@/lib/supabase/server';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});

export async function POST(request: NextRequest) {
  try {
    const { filename, contentType, type } = await request.json();
    
    // Auth check
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const supabase = createServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const beatId = crypto.randomUUID();
    const key = `beats/${user.id}/${beatId}/${type}/${filename}`;
    
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

    console.log('Generated Presigned URL:', {
      url: uploadUrl,
      bucket: process.env.R2_BUCKET_NAME,
      key: key,
      contentType: contentType
    });

    return NextResponse.json({ uploadUrl, key, beatId });
  } catch (error: any) {
    console.error('Presigned URL Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
