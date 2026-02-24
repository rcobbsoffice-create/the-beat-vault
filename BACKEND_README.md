# AudioGenes - Backend Implementation

This document describes the backend implementation completed for the AudioGenes platform.

## Overview

The backend is built using **Supabase** (PostgreSQL + Edge Functions) with integrations for:

- Stripe Connect (payments)
- Cloudflare R2 (file storage)
- ACRCloud (audio fingerprinting)
- Printful (merchandise)

## What Was Implemented

### 1. Database Schema ✅

**File**: `supabase/complete_schema.sql`

Complete PostgreSQL database with 25+ tables:

- User authentication & profiles
- Beat catalog & licensing
- Payment & transaction processing
- Merchandise management
- Distribution & analytics
- Audio fingerprinting
- Editorial content
- Newsletter system

**Key Features**:

- UUID primary keys
- Proper foreign key relationships
- JSONB columns for flexible data
- Indexed columns for performance
- Automatic timestamps
- Database triggers

### 2. Row Level Security (RLS) ✅

**File**: `supabase/complete_rls_policies.sql`

Comprehensive security policies for all tables:

- User can only access their own data
- Producers manage their own beats/products
- Public can view published content
- Admins have full access
- System (Edge Functions) can manage automated data

**Security Principles**:

- Least privilege access
- Role-based permissions (artist, producer, admin, editor)
- Separate policies for SELECT, INSERT, UPDATE, DELETE
- Service role for backend operations

### 3. Edge Functions (Serverless APIs) ✅

**Location**: `supabase/functions/`

#### Beat Management

- `update-beat` - Update beat metadata
- `delete-beat` - Soft delete (archive) beats
- `toggle-favorite` - Add/remove beat favorites
- `analyze-audio` - Generate audio pulse data (existing)
- `create-beat-as-admin` - Admin beat creation (existing)

#### Payment & Commerce

- `create-checkout-session` - Stripe checkout for beat purchases
- `stripe-webhook` - Handle Stripe payment events
- `create-producer-account` - Stripe Connect onboarding
- `create-merch-product` - Printful integration (existing)
- `create-printful-store` - Printful store setup (existing)
- `fulfill-order` - Order fulfillment (existing)

#### Audio Fingerprinting

- `process-fingerprint` - ACRCloud fingerprint generation (existing)
- `sync-detections` - Sync detection data (existing)
- `webhook-acrcloud` - ACRCloud webhook handler (existing)

#### Analytics & Tracking

- `track-event` - Record user analytics events
- `sync-distribution-data` - Sync DSP streaming data

#### Communication

- `send-newsletter` - Send email newsletters
- `submit-artist-questionnaire` - Artist onboarding form

#### Merchandise

- `process-merch-idea` - AI-generated merch (existing)

### 4. Helper SQL Functions ✅

**File**: `supabase/helper_functions.sql`

Utility functions for common operations:

- `increment_play_count()` - Track beat plays
- `increment_view_count()` - Track beat views
- `increment_purchase_count()` - Track purchases
- `get_beat_analytics()` - Get beat performance metrics
- `get_producer_analytics()` - Get producer dashboard stats
- `search_beats()` - Advanced beat search with filters
- `get_trending_beats()` - Calculate trending beats
- `update_beat_tracking_summary()` - Update fingerprint stats

### 5. Security Improvements ✅

**File**: `lib/r2.ts`

- Removed hardcoded R2 credentials
- Use environment variables instead
- Added proper error handling
- Never expose secrets to client

**File**: `.env.example`

- Complete environment variable template
- Clear documentation for each variable
- Separation of client-safe vs server-only secrets

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Expo/React Native)            │
│  - iOS, Android, Web                                        │
│  - TypeScript + NativeWind                                  │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ├─── Supabase Client (anon key)
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                     SUPABASE BACKEND                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                  │  │
│  │  - 25+ tables                                         │  │
│  │  - Row Level Security (RLS)                           │  │
│  │  - Triggers & Functions                               │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Edge Functions (Deno)                                │  │
│  │  - Serverless APIs                                    │  │
│  │  - Payment processing                                 │  │
│  │  - File operations                                    │  │
│  │  - Analytics                                          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication                                        │  │
│  │  - Email/Password                                     │  │
│  │  - OAuth providers                                    │  │
│  │  - JWT tokens                                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          │           │           │
┌─────────▼─────┐ ┌───▼─────┐ ┌──▼──────────┐
│ Stripe        │ │  R2     │ │  ACRCloud   │
│ Connect       │ │ Storage │ │ Fingerprint │
│ (Payments)    │ │ (Files) │ │ (Tracking)  │
└───────────────┘ └─────────┘ └─────────────┘
```

## API Endpoints

All Edge Functions are available at:

```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/{function-name}
```

### Authentication Required

Most endpoints require the `Authorization` header:

```typescript
headers: {
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
}
```

### Example: Create Checkout Session

```typescript
const response = await fetch(
  "https://YOUR_PROJECT.supabase.co/functions/v1/create-checkout-session",
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      beat_id: "uuid-here",
      license_type: "basic",
      buyer_email: "user@example.com",
      success_url: "https://app.com/success",
      cancel_url: "https://app.com/cancel",
    }),
  },
);

const { session_id, url } = await response.json();
// Redirect user to Stripe Checkout
window.location.href = url;
```

### Example: Track Analytics Event

```typescript
await fetch("https://YOUR_PROJECT.supabase.co/functions/v1/track-event", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    event_type: "beat_play",
    beat_id: "uuid-here",
    user_id: "uuid-here", // optional
    session_id: "session-id",
    metadata: { duration: 120 },
  }),
});
```

## Database Access

### Direct Table Access (PostgREST)

Supabase auto-generates REST APIs for all tables:

```typescript
// Get published beats
const { data, error } = await supabase
  .from("beats")
  .select("*, producer:profiles(*), licenses(*)")
  .eq("status", "published")
  .order("created_at", { ascending: false })
  .limit(20);

// Insert a beat favorite
const { error } = await supabase.from("beat_favorites").insert({
  user_id: user.id,
  beat_id: beatId,
});

// Update producer profile
const { error } = await supabase
  .from("producers")
  .update({ branding: { tagline: "New tagline" } })
  .eq("profile_id", user.id);
```

### Using Helper Functions

```typescript
// Get beat analytics
const { data } = await supabase.rpc("get_beat_analytics", {
  beat_id_param: beatId,
});

// Search beats
const { data } = await supabase.rpc("search_beats", {
  search_query: "trap",
  genre_filter: "Trap",
  min_bpm: 140,
  max_bpm: 160,
  sort_by: "play_count",
  sort_order: "DESC",
  limit_count: 20,
  offset_count: 0,
});

// Get trending beats
const { data } = await supabase.rpc("get_trending_beats", { limit_count: 10 });
```

## Payment Flow

### Beat Purchase Process

1. **User browses marketplace** → `beats` table (RLS: public read for published)
2. **User clicks "Buy"** → Frontend calls `create-checkout-session` Edge Function
3. **Stripe checkout session created** → User redirected to Stripe
4. **User completes payment** → Stripe sends webhook to `stripe-webhook`
5. **Webhook updates purchase** → `purchases` table updated to 'completed'
6. **User receives files** → Download links generated (TODO: implement)

### Producer Onboarding

1. **User signs up** → Profile created via trigger
2. **User becomes producer** → Calls `create-producer-account`
3. **Stripe Connect account created** → User redirected to Stripe onboarding
4. **User completes onboarding** → Producer profile updated
5. **Producer can accept payments** → Ready to receive transfers

## File Storage

Files are stored in Cloudflare R2 (S3-compatible):

### Upload Flow

1. Frontend picks file (audio, image)
2. Convert to Buffer
3. Call `uploadToR2()` from Edge Function
4. Store returned URL in database

### File Paths

```
beats/{beat_id}/original.wav
beats/{beat_id}/preview.mp3
beats/{beat_id}/artwork.jpg
beats/{beat_id}/stems/drums.wav
beats/{beat_id}/stems/melody.wav
beats/{beat_id}/stems/bass.wav
```

## Analytics

### Events Tracked

- `beat_play` - Beat played
- `beat_view` - Beat page viewed
- `beat_favorite` - Beat favorited
- `beat_purchase` - Beat purchased
- `producer_view` - Producer page viewed
- `search` - Search performed

### Analytics Dashboard

Producers can view:

- Total plays, views, favorites
- Revenue breakdown
- Geographic data
- Trending beats
- Top performing beats

## Monitoring

### Supabase Dashboard

- Database > Tables: View and edit data
- Authentication > Users: Manage users
- Storage > Buckets: Manage files
- Logs > Functions: Debug Edge Functions
- Reports > API: Monitor API usage

### Stripe Dashboard

- Payments > All payments: Track transactions
- Connect > Accounts: Manage producer accounts
- Webhooks: Monitor webhook events
- Logs: Debug payment issues

## What's NOT Implemented (Future Work)

1. **Email Integration** - Newsletter sending uses placeholder
2. **DSP Integration** - Distribution data sync needs real API
3. **AI Content Generation** - Questionnaire processing placeholder
4. **Download Link Generation** - Purchase file delivery
5. **Advanced Analytics** - Real-time dashboards
6. **File Processing** - Audio conversion, thumbnails
7. **Cron Jobs** - Scheduled tasks for syncing data

## Testing

### Local Testing

```bash
# Start Supabase locally
supabase start

# Run Edge Function locally
supabase functions serve FUNCTION_NAME

# Test with curl
curl -X POST http://localhost:54321/functions/v1/FUNCTION_NAME \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

### Production Testing

Use Stripe test mode:

- Test cards: `4242 4242 4242 4242`
- Test webhooks with Stripe CLI
- Create test users and data

## Maintenance

### Regular Tasks

1. **Monitor Logs** - Check for errors in Edge Functions
2. **Review RLS** - Ensure security policies are correct
3. **Database Backups** - Supabase auto-backups, but export important data
4. **Update Dependencies** - Keep Supabase, Stripe, etc. updated
5. **Review Webhooks** - Ensure webhooks are receiving events

### Performance

- Add indexes for slow queries
- Use database functions for complex operations
- Cache frequently accessed data
- Optimize RLS policies

## Support

For issues:

1. Check Supabase logs
2. Review Stripe webhook events
3. Test Edge Functions locally
4. Check RLS policies
5. Verify environment variables

## License

MIT

---

**Last Updated**: February 23, 2026
**Version**: 1.0.0
