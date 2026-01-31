const { S3Client, PutBucketPolicyCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function setPublicReadPolicy() {
  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'PublicReadGetObject',
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${process.env.R2_BUCKET_NAME}/*`,
      },
    ],
  };

  try {
    const command = new PutBucketPolicyCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Policy: JSON.stringify(policy),
    });

    await r2Client.send(command);
    console.log('✅ Successfully set public read policy on bucket');
  } catch (err) {
    console.error('❌ Error setting bucket policy:', err);
  }
}

setPublicReadPolicy();
