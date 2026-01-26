
const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3');
require('dotenv').config({ path: '.env.local' });

async function listBuckets() {
  console.log('--- R2 Credential Check ---');
  const r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
  });

  try {
    const data = await r2Client.send(new ListBucketsCommand({}));
    console.log('SUCCESS: Credentials can list buckets.');
    console.log('Buckets:', data.Buckets.map(b => b.Name));
  } catch (err) {
    console.error('FAILURE: Could not list buckets.');
    console.error('Error:', err.message);
  }
}

listBuckets();
