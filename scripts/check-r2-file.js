
        const { S3Client, HeadObjectCommand } = require('@aws-sdk/client-s3');
        require('dotenv').config({ path: '.env.local' });

        async function checkFile() {
          const r2Client = new S3Client({
            region: 'auto',
            endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
            credentials: {
              accessKeyId: process.env.R2_ACCESS_KEY_ID,
              secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
            },
          });

          // Metadata from previous step
          const audioKey = 'beats/90851a87-254f-4ee2-a6fd-2d3d8049b3dd/3968a53b-93af-4774-80aa-cd6e4c91288b/original/Finish line.mp3';
          const artworkKey = 'beats/90851a87-254f-4ee2-a6fd-2d3d8049b3dd/1bf5cb35-5323-4dfe-95f8-0a49ac7ab442/artwork/dna-3539309.jpg';

          console.log('Checking Audio:', audioKey);
          try {
            await r2Client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: audioKey }));
            console.log('✅ Audio file exists');
          } catch (e) {
            console.error('❌ Audio file missing:', e.name, e.$metadata?.httpStatusCode);
          }

          console.log('\nChecking Artwork:', artworkKey);
          try {
            await r2Client.send(new HeadObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: artworkKey }));
            console.log('✅ Artwork file exists');
          } catch (e) {
            console.error('❌ Artwork file missing:', e.name, e.$metadata?.httpStatusCode);
          }
        }

        checkFile();
