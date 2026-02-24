# AudioGenes

A unified platform that combines beat licensing, music distribution, royalty splitting, and sync licensing into a single rights-aware system.

## One-Sentence Summary

Enabling creators and companies to license and monetize music instantly without legal or operational friction.

## Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Stripe Connect (multi-vendor)
- **Storage**: Cloudflare R2
- **Audio**: WaveSurfer.js

## Features

- 🎵 Beat marketplace with advanced filtering
- 🎧 Audio player with waveform visualization
- 💳 Stripe Connect payments with revenue splits
- 👤 Role-based dashboards (Artist, Producer, Admin)
- 📤 Beat upload wizard for producers
- 🔐 Secure authentication with Supabase

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Stripe account with Connect enabled
- Cloudflare R2 bucket (optional)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Configure the following in `.env.local`:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key-id
R2_SECRET_ACCESS_KEY=your-secret-access-key
R2_BUCKET_NAME=beat-vault-audio
R2_PUBLIC_URL=https://your-bucket.r2.dev

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_FEE_PERCENTAGE=15
```

### Database Setup

Run the schema in Supabase SQL Editor:

```bash
# Located at supabase/schema.sql
```

## Project Structure

```
the-beat-vault/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   └── stripe/        # Stripe Connect, Checkout, Webhooks
│   ├── dashboard/         # Role-based dashboards
│   ├── marketplace/       # Beat browsing
│   ├── login/             # Auth pages
│   └── signup/
├── components/            # React components
│   ├── ui/               # Design system
│   └── providers/        # Context providers
├── lib/                  # Utilities
│   ├── supabase.ts      # Supabase client
│   ├── stripe.ts        # Stripe utilities
│   └── r2.ts            # R2 storage
├── stores/              # Zustand state
├── types/               # TypeScript types
└── supabase/           # Database schema
```

## Development

```bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run lint    # Run ESLint
```

## Deploy on Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## License

MIT
