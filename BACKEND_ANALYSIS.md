# The Beat Vault - Backend Analysis & Implementation Plan

## 1. Website Purpose & Overview

**The Beat Vault (AudioGenes)** is a comprehensive music platform that combines:
- 🎵 **Beat Marketplace**: Producers can upload and sell beats with multiple licensing options
- 🎧 **Music Distribution**: Artists can distribute music to DSPs (Spotify, Apple Music, etc.)
- 💰 **Royalty Splitting**: Rights-aware system for revenue sharing
- 🎤 **Sync Licensing**: Music licensing for media projects
- 📰 **Editorial Content**: Magazine-style articles and artist features
- 🛍️ **Merchandise**: Producers can sell branded merch
- 📊 **Analytics**: Track plays, views, revenue, and distribution data
- 🔍 **Audio Fingerprinting**: Track unauthorized usage across platforms

## 2. Technology Stack

### Frontend
- **Framework**: Expo (React Native) - Cross-platform (Web, iOS, Android)
- **Language**: TypeScript
- **Styling**: NativeWind (Tailwind for React Native)
- **Routing**: Expo Router (file-based routing)
- **State Management**: Zustand
- **UI Components**: Custom UI library with Lucide icons
- **Audio Visualization**: WaveSurfer.js

### Backend (Existing)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Serverless Functions**: Supabase Edge Functions (Deno)
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Payments**: Stripe Connect (multi-vendor)
- **Audio Processing**: ACRCloud (fingerprinting)

## 3. Existing Frontend Components & Pages

### Public Pages
- `/` - Homepage with trending beats and features
- `/marketplace` - Beat browsing with filters
- `/beats/[id]` - Individual beat details
- `/producers/[id]` - Producer storefront
- `/producers` - Producer directory
- `/login` - Authentication
- `/signup` - User registration
- `/pricing` - Platform pricing plans

### Dashboard Pages (Role-Based)

#### Producer Dashboard
- `/dashboard/producer/upload` - Beat upload wizard
- `/dashboard/producer/bulk-upload` - CSV bulk upload
- `/dashboard/producer/beats` - Manage beats
- `/dashboard/producer/beats/[id]/edit` - Edit beat
- `/dashboard/producer/sales` - Sales analytics
- `/dashboard/producer/analytics` - Performance metrics
- `/dashboard/producer/storefront` - Storefront customization
- `/dashboard/producer/track-monitoring` - Audio fingerprinting

#### Artist Dashboard
- `/dashboard/artist/library` - Music library
- `/dashboard/artist/distribution` - DSP distribution
- `/dashboard/artist/distribution/new` - New distribution
- `/dashboard/artist/insights` - Analytics
- `/dashboard/artist/questionnaire` - Artist questionnaire

#### Admin Dashboard
- `/dashboard/admin` - Admin overview
- `/dashboard/admin/beats` - Manage all beats
- `/dashboard/admin/users` - User management
- `/dashboard/admin/upload` - Admin beat upload
- `/dashboard/admin/bulk-upload` - Admin bulk upload
- `/dashboard/admin/genres` - Genre management
- `/dashboard/admin/revenue` - Revenue analytics
- `/dashboard/admin/analytics` - Platform analytics
- `/dashboard/admin/fingerprinting` - Fingerprint management
- `/dashboard/admin/newsletters` - Newsletter management
- `/dashboard/admin/artists` - Artist management
- `/dashboard/admin/merch` - Merch management
- `/dashboard/admin/editorial` - Editorial content
- `/dashboard/admin/editorial/questionnaire` - Questionnaire management

#### Shared Dashboard
- `/dashboard/settings` - User settings
- `/dashboard/settings/whitelist` - Whitelist management
- `/dashboard/contacts` - Contact management

## 4. Database Schema Overview

### Core Tables (Confirmed Needed)
1. **profiles** - User profiles with role-based access (artist, producer, admin)
2. **producers** - Extended producer profiles with store settings
3. **beats** - Beat catalog with metadata, pricing, and licensing
4. **licenses** - License types and pricing for beats
5. **purchases** - Beat purchase records
6. **genres** / **genre_settings** - Genre taxonomy
7. **artists** - Artist profiles
8. **artist_profiles_ext** - Extended artist metadata
9. **articles** - Editorial/magazine content
10. **charts** - Music charts and rankings
11. **submissions** - Artist submissions for features
12. **artist_questionnaires** - Artist onboarding questionnaires
13. **merch_products** - Merchandise products
14. **orders** - Merchandise orders
15. **stores** - Storefront customization
16. **newsletters** - Newsletter management
17. **contacts** - Contact management
18. **distribution_data** - DSP streaming and revenue data
19. **audio_fingerprints** - ACRCloud fingerprint data
20. **track_detections** - Detected unauthorized usage
21. **beat_tracking_summary** - Aggregated tracking stats
22. **analytics_events** - User interaction analytics
23. **pulse_data** - Audio visualization data
24. **admin_fingerprint_global_stats** - Admin analytics
25. **admin_fingerprint_platform_stats** - Platform-specific analytics

## 5. Existing Edge Functions

Located in `supabase/functions/`:
1. **analyze-audio** - Audio analysis for pulse/visualization data
2. **create-beat-as-admin** - Admin beat creation
3. **create-merch-product** - Printful integration for merch
4. **create-printful-store** - Printful store setup
5. **fulfill-order** - Order fulfillment automation
6. **process-fingerprint** - ACRCloud fingerprint generation
7. **process-merch-idea** - AI-generated merch ideas
8. **sync-detections** - Sync fingerprint detections
9. **webhook-acrcloud** - ACRCloud webhook handler

## 6. Missing Backend Functionality

### Critical Missing Components

#### A. Complete Database Schema
- **Issue**: Tables are defined across multiple SQL files but may not be executed
- **Solution**: Create a comprehensive migration script that includes all tables
- **Priority**: HIGH

#### B. Missing Edge Functions
The following API endpoints are needed but missing:
1. **Beat Operations**
   - `create-beat` - General beat creation (non-admin)
   - `update-beat` - Beat updates
   - `delete-beat` - Beat deletion
   - `get-beats` - Beat listing with pagination/filters (can use PostgREST)
   
2. **Purchase Flow**
   - `create-checkout-session` - Stripe checkout
   - `handle-payment-webhook` - Stripe webhook handler
   - `process-purchase` - Post-purchase processing

3. **Producer Operations**
   - `create-producer-profile` - Producer onboarding
   - `update-storefront` - Storefront customization
   - `connect-stripe` - Stripe Connect onboarding

4. **Distribution**
   - `create-distribution` - Submit to DSPs
   - `sync-distribution-data` - Fetch DSP analytics
   - `update-distribution-status` - Status updates

5. **Newsletter**
   - `send-newsletter` - Email broadcasting
   
6. **Analytics**
   - `track-event` - Event tracking
   - `get-analytics` - Analytics aggregation

7. **Artist Features**
   - `submit-questionnaire` - Artist questionnaire submission
   - `generate-artist-content` - AI content generation from questionnaire

#### C. Row Level Security (RLS) Policies
- **Status**: Partially implemented
- **Needed**: Complete RLS policies for all tables
- **Priority**: HIGH (security critical)

#### D. Storage Buckets
- **Needed**: Supabase Storage buckets for:
  - Beat audio files (fallback to R2)
  - Artwork/images
  - Stems
  - Profile avatars
- **Status**: R2 is configured, but Supabase Storage setup is missing

#### E. API Route Handlers (if using Next.js API routes)
- **Status**: N/A (Expo app, not Next.js)
- **Note**: README mentions Next.js but codebase is Expo

#### F. Background Jobs
- **Needed**:
  - Audio processing queue
  - Fingerprint sync scheduler
  - Distribution data sync
  - Email queue
- **Solution**: Use Supabase Cron Jobs or external service

#### G. Environment Configuration
- **Missing**: `.env.local` or `.env` file
- **Needed**: Environment variables for:
  - Supabase URL and keys
  - Stripe keys
  - R2 credentials (hardcoded currently - security risk!)
  - ACRCloud API keys
  - SMTP credentials

## 7. Implementation Priorities

### Phase 1: Core Backend Setup (HIGH PRIORITY)
1. ✅ Create comprehensive database schema migration
2. ✅ Create .env.example file
3. ✅ Fix R2 credentials security issue
4. ✅ Implement missing Edge Functions for critical flows:
   - Beat CRUD operations
   - Purchase flow
   - Producer onboarding

### Phase 2: Feature Completion (MEDIUM PRIORITY)
5. ✅ Distribution system Edge Functions
6. ✅ Newsletter functionality
7. ✅ Analytics tracking
8. ✅ Complete RLS policies

### Phase 3: Enhancement (LOWER PRIORITY)
9. Background job setup
10. Email integration
11. Advanced features (AI content generation, etc.)

## 8. Next Steps

1. Create consolidated database schema
2. Implement missing Edge Functions
3. Set up environment configuration
4. Test all backend endpoints
5. Document API usage
6. Deploy to Supabase

---

**Status**: Analysis Complete ✅
**Next**: Begin implementation of missing backend components
