## Step 0: Verify API Token Permissions

My diagnostic tests show an **Access Denied** error from Cloudflare even before the browser gets involved. This usually means your API Token doesn't have the right permissions for the `beatvault` bucket.

1.  Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2.  Navigate to **R2** > **Manage R2 API Tokens**.
3.  Click **Create API token**.
4.  **Token name**: `AudioGenes Uploads`.
5.  **Permissions**: Select **Object Read & Write** (or "Admin Read & Write" for full control).
6.  **Bucket scoping**: You can select "All buckets" or specifically the `beatvault` bucket.
7.  Click **Create Token**.
8.  **IMPORTANT**: Copy the new **Access Key ID** and **Secret Access Key** into your `.env.local` file, replacing the old ones.

---

## Step 1: Use a Custom Domain (CRITICAL for CORS)

Cloudflare **does not support CORS** on the default `pub-xxx.r2.dev` subdomains. To allow your web app (`localhost:8081`) to fetch audio files, you **must** connect a custom domain to your bucket.

1.  In the Cloudflare Dashboard, go to your bucket > **Settings**.
2.  Find **Public Access** > **Custom Domains**.
3.  Click **Connect Domain** and follow the steps to add a subdomain (e.g., `assets.yourdomain.com`).
4.  Once the domain is active, update your `.env.local`:
    ```bash
    EXPO_PUBLIC_R2_PUBLIC_URL=https://assets.yourdomain.com
    ```

---

## Step 2: Configure CORS Policy

Once your tokens are correct, you still need the CORS policy to allow the browser to talk to R2.

1.  Navigate to **R2** in the sidebar.
2.  Select your bucket (`beatvault`).
3.  Go to the **Settings** tab.
4.  Scroll down to the **CORS Policy** section and click **Edit CORS Policy**.
5.  Paste the following JSON configuration (Updated with required headers):

```json
[
  {
    "AllowedHeaders": [
      "*",
      "Content-Type",
      "x-amz-sdk-checksum-algorithm",
      "x-amz-checksum-crc32"
    ],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": [
      "http://localhost:8081",
      "https://your-production-domain.com"
    ],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

> [!NOTE]
> I have also updated the server-side code to use **Path Style** URLs (e.g., `https://<account_id>.r2.cloudflarestorage.com/<bucket>`), which improves CORS reliability with some browsers.

> [!IMPORTANT]
> Replace `https://your-production-domain.com` with your actual production URL when you deploy.

7.  Click **Save**.
8.  Try the upload again in your application.
