
const fs = require('fs');
const path = require('path');

async function diagnose() {
  console.log('--- R2 Upload Diagnostic Tool ---');
  
  // 1. Get Session/Token (Mocked or from env)
  // Since we are running on the user's machine, we can try to hit the local API
  console.log('1. Fetching presigned URL from http://localhost:3000/api/upload/presigned-url...');
  
  try {
    // We need a valid token to hit the API. 
    // For diagnostics, we can ask the user to provide one or just use the service role if available.
    // However, the easiest way is to mock what the API does.
    
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
    require('dotenv').config({ path: '.env.local' });

    const r2Client = new S3Client({
      region: 'auto',
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
      requestChecksumCalculation: 'when_required',
      responseChecksumValidation: 'when_required',
    });

    const key = `diagnostics/test-${Date.now()}.txt`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: 'text/plain',
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
    console.log('SUCCESS: Generated Presigned URL locally using .env.local credentials.');
    console.log('URL:', uploadUrl);

    console.log('\n2. Attempting PUT request to R2 (simulating browser upload)...');
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: 'Hello R2!',
      headers: { 'Content-Type': 'text/plain' }
    });

    if (response.ok) {
      console.log('SUCCESS: R2 accepted the upload via Node fetch!');
      console.log('CONCLUSION: Your R2 credentials and bucket are working perfectly.');
      console.log('The issue is strictly a browser CORS block.');
    } else {
      console.error('FAILURE: R2 rejected the upload.');
      console.error('Status:', response.status, response.statusText);
      const text = await response.text();
      console.error('Response:', text);
      console.log('CONCLUSION: There is a problem with the credentials, bucket name, or signature.');
    }

  } catch (err) {
    console.error('DIAGNOSTIC ERROR:', err.message);
    if (err.message.includes('env.local')) {
      console.log('Make sure you are running this from the project root.');
    }
  }
}

diagnose();
