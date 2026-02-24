# The Beat Vault - Deployment Guide

Complete guide to deploying The Beat Vault backend and frontend.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Database Setup](#database-setup)
4. [Edge Functions Deployment](#edge-functions-deployment)
5. [Stripe Configuration](#stripe-configuration)
6. [Cloudflare R2 Setup](#cloudflare-r2-setup)
7. [Environment Variables](#environment-variables)
8. [Frontend Deployment](#frontend-deployment)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have:
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Supabase account (https://supabase.com)
- [ ] Stripe account with Connect enabled (https://stripe.com)
- [ ] Cloudflare account for R2 storage (https://cloudflare.com)
- [ ] (Optional) ACRCloud account for audio fingerprinting
- [ ] (Optional) Printful account for merchandise

---

## Supabase Setup

### 1. Create Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Enter project details:
   - Name: `the-beat-vault`
   - Database Password: (save this securely)
   - Region: Choose closest to your users
4. Wait for project to be provisioned (~2 minutes)

### 2. Get API Keys

1. Go to Project Settings > API
2. Copy the following values:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ NEVER expose this!)

---

## Database Setup

### Step 1: Run Main Schema

1. Go to Supabase Dashboard > SQL Editor
2. Create a new query
3. Copy the contents of `supabase/complete_schema.sql`
4. Paste and click "Run"
5. Wait for completion (may take 30-60 seconds)

### Step 2: Run RLS Policies

1. Create another new query
2. Copy the contents of `supabase/complete_rls_policies.sql`
3. Paste and click "Run"

### Step 3: Run Helper Functions

1. Create another new query
2. Copy the contents of `supabase/helper_functions.sql`
3. Paste and click "Run"

### Step 4: Run Additional Migrations (if needed)

Execute any files in `supabase/migrations/` that haven't been run:

```bash
# If using Supabase CLI locally
supabase db push
```

### Verification

Check that all tables exist:
```sql
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

You should see: `analytics_events`, `articles`, `artist_profiles_ext`, `artists`, `audio_fingerprints`, `beat_favorites`, `beats`, `charts`, `contacts`, `distribution_data`, `genre_settings`, `licenses`, `merch_products`, `newsletters`, `orders`, `producers`, `profiles`, `pulse_data`, `purchases`, `stores`, `submissions`, `track_detections`, etc.

---

## Edge Functions Deployment

### Install Supabase CLI

```bash
npm install -g supabase
```

### Login to Supabase

```bash
supabase login
```

### Link Your Project

```bash
cd /path/to/the-beat-vault
supabase link --project-ref YOUR_PROJECT_REF
```

Find YOUR_PROJECT_REF in Supabase Dashboard > Settings > General

### Deploy All Edge Functions

```bash
# Deploy individual functions
supabase functions deploy analyze-audio
supabase functions deploy create-beat-as-admin
supabase functions deploy create-checkout-session
supabase functions deploy create-merch-product
supabase functions deploy create-printful-store
supabase functions deploy create-producer-account
supabase functions deploy delete-beat
supabase functions deploy fulfill-order
supabase functions deploy process-fingerprint
supabase functions deploy process-merch-idea
supabase functions deploy send-newsletter
supabase functions deploy stripe-webhook
supabase functions deploy submit-artist-questionnaire
supabase functions deploy sync-detections
supabase functions deploy sync-distribution-data
supabase functions deploy toggle-favorite
supabase functions deploy track-event
supabase functions deploy update-beat
supabase functions deploy webhook-acrcloud
```

Or deploy all at once:

```bash
# This will deploy all functions in supabase/functions/
supabase functions deploy --no-verify-jwt
```

### Set Function Secrets

Set environment variables for Edge Functions:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxxxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
supabase secrets set R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
supabase secrets set R2_ACCESS_KEY_ID=xxxxx
supabase secrets set R2_SECRET_ACCESS_KEY=xxxxx
supabase secrets set R2_BUCKET_NAME=beatvault
supabase secrets set R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
supabase secrets set ACRCLOUD_ACCESS_KEY=xxxxx
supabase secrets set ACRCLOUD_ACCESS_SECRET=xxxxx
supabase secrets set PRINTFUL_API_TOKEN=xxxxx
supabase secrets set PLATFORM_FEE_PERCENTAGE=15
```

---

## Stripe Configuration

### 1. Enable Stripe Connect

1. Go to https://dashboard.stripe.com/connect/accounts/overview
2. Click "Get Started" with Connect
3. Complete the onboarding

### 2. Get API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy:
   - **Publishable key** → `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** → `STRIPE_SECRET_KEY`

### 3. Set Up Webhooks

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook`
4. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Test Mode

For development, use test mode keys (prefix `pk_test_` and `sk_test_`)

---

## Cloudflare R2 Setup

### 1. Create R2 Bucket

1. Go to Cloudflare Dashboard > R2
2. Click "Create bucket"
3. Name: `beatvault`
4. Location: Automatic
5. Click "Create bucket"

### 2. Get Access Keys

1. Go to R2 > Manage R2 API Tokens
2. Click "Create API token"
3. Name: `beat-vault-api`
4. Permissions: Admin Read & Write
5. Click "Create API token"
6. Copy:
   - **Access Key ID** → `R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `R2_SECRET_ACCESS_KEY`

### 3. Configure CORS

1. Go to your bucket settings
2. Click on "Settings" > "CORS Policy"
3. Copy the contents of `cors.json` and paste it
4. Save

### 4. Enable Public Access

1. Go to bucket settings
2. Click "Connect a domain"
3. Follow the wizard to get a public URL → `R2_PUBLIC_URL`

---

## Environment Variables

### 1. Create .env File

```bash
cd /path/to/the-beat-vault
cp .env.example .env
```

### 2. Fill in All Values

Edit `.env` and fill in all the values you've collected:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# R2
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxxxx
R2_SECRET_ACCESS_KEY=xxxxx
R2_BUCKET_NAME=beatvault
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev

# App
EXPO_PUBLIC_APP_URL=http://localhost:8081
PLATFORM_FEE_PERCENTAGE=15
```

⚠️ **IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

---

## Frontend Deployment

### Local Development

```bash
# Install dependencies
npm install

# Start Expo development server
npm start

# For web
npm run web

# For iOS (requires Mac + Xcode)
npm run ios

# For Android (requires Android Studio)
npm run android
```

### Web Deployment (Vercel)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
npm run build
vercel --prod
```

3. Set environment variables in Vercel Dashboard

### Mobile App Deployment

#### iOS (App Store)

```bash
# Build for iOS
eas build --platform ios

# Submit to App Store
eas submit --platform ios
```

#### Android (Google Play)

```bash
# Build for Android
eas build --platform android

# Submit to Play Store
eas submit --platform android
```

---

## Testing

### Test Database Connection

1. Go to Supabase Dashboard > Table Editor
2. Verify all tables are present
3. Try inserting a test record

### Test Edge Functions

```bash
# Test locally
supabase functions serve analyze-audio

# In another terminal
curl -X POST http://localhost:54321/functions/v1/analyze-audio \
  -H "Content-Type: application/json" \
  -d '{"beat_id": "test-id"}'
```

### Test Stripe Webhooks

Use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook
```

### Test Frontend

1. Start development server: `npm start`
2. Test key flows:
   - [ ] User signup/login
   - [ ] Browse marketplace
   - [ ] Upload a beat (producer)
   - [ ] Purchase a beat (artist)
   - [ ] View analytics dashboard

---

## Troubleshooting

### Database Issues

**Problem**: Tables not created
**Solution**: 
- Check SQL Editor for errors
- Run schema files one at a time
- Check Supabase logs: Dashboard > Logs

**Problem**: RLS prevents access
**Solution**:
- Verify user is authenticated
- Check RLS policies match your use case
- Temporarily disable RLS for testing (not recommended for production)

### Edge Functions Issues

**Problem**: Function fails to deploy
**Solution**:
```bash
# Check function logs
supabase functions logs FUNCTION_NAME

# Verify TypeScript syntax
deno check supabase/functions/FUNCTION_NAME/index.ts
```

**Problem**: Function returns 401 Unauthorized
**Solution**:
- Verify Authorization header is being sent
- Check if JWT verification is required
- Use `--no-verify-jwt` flag for testing only

### Stripe Issues

**Problem**: Webhook not receiving events
**Solution**:
- Verify webhook endpoint URL is correct
- Check Stripe Dashboard > Webhooks > Events
- Verify webhook secret matches

**Problem**: Connect account creation fails
**Solution**:
- Verify Stripe Connect is enabled
- Check that user email is valid
- Review Stripe logs

### R2 Upload Issues

**Problem**: Upload fails with authentication error
**Solution**:
- Verify R2 credentials are correct
- Check that API token has write permissions
- Verify bucket name matches

**Problem**: CORS errors
**Solution**:
- Verify CORS policy is set on bucket
- Check allowed origins include your domain
- Clear browser cache

### Frontend Issues

**Problem**: Can't connect to Supabase
**Solution**:
- Verify `.env` file exists and has correct values
- Restart Expo dev server
- Check network tab for actual API calls

**Problem**: Stripe checkout doesn't work
**Solution**:
- Verify Stripe publishable key is set
- Check browser console for errors
- Verify producer has completed Stripe onboarding

---

## Security Checklist

Before going to production:

- [ ] All environment variables set
- [ ] RLS policies enabled on all tables
- [ ] Service role key never exposed to client
- [ ] Stripe webhook secret configured
- [ ] R2 credentials secure
- [ ] CORS properly configured
- [ ] Rate limiting enabled (Supabase Dashboard)
- [ ] Email verification enabled for signups
- [ ] File upload size limits set
- [ ] Test with Stripe test mode first

---

## Next Steps

After deployment:

1. **Create admin user**:
   - Sign up normally
   - Go to Supabase Dashboard > Table Editor > profiles
   - Find your user and set role to 'admin'

2. **Add initial genres**:
   - Already seeded in schema
   - Add more via admin dashboard

3. **Set up monitoring**:
   - Enable Supabase Email notifications
   - Set up Sentry or similar for error tracking

4. **Configure email**:
   - Go to Supabase Dashboard > Authentication > Email Templates
   - Customize signup/reset password emails

5. **Test payment flow**:
   - Create a test producer account
   - Upload a test beat
   - Complete a test purchase
   - Verify Stripe transfer

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs
- **Expo Docs**: https://docs.expo.dev
- **Cloudflare R2**: https://developers.cloudflare.com/r2/

---

## License

MIT
