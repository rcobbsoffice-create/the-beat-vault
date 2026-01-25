// Database type definitions
export type UserRole = 'producer' | 'customer' | 'admin';
export type BeatStatus = 'draft' | 'published' | 'archived';
export type LicenseType = 'basic' | 'premium' | 'exclusive';
export type PurchaseStatus = 'pending' | 'completed' | 'refunded';
export type AnalyticsEventType = 'view' | 'play' | 'purchase' | 'share' | 'download';

export interface Profile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Producer {
  id: string;
  profile_id: string;
  store_slug: string;
  branding: Record<string, any>;
  stripe_account_id: string | null;
  status: 'pending' | 'active' | 'disabled';
  created_at: string;
}

export interface Beat {
  id: string;
  producer_id: string;
  title: string;
  description: string | null;
  genre: string | null;
  mood_tags: string[] | null;
  bpm: number | null;
  key: string | null;
  duration: number | null;
  audio_url: string;
  preview_url: string;
  artwork_url: string | null;
  waveform_data: WaveformData | null;
  status: BeatStatus;
  play_count: number;
  is_sync_ready: boolean;
  isrc: string | null;
  upc: string | null;
  label: string | null;
  publisher: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  // Joined data
  producer?: Profile;
  licenses?: License[];
}

export interface License {
  id: string;
  beat_id: string;
  type: LicenseType;
  price: number;
  terms: string | null;
  files_included: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  buyer_id: string;
  beat_id: string;
  license_id: string;
  stripe_payment_intent_id: string;
  amount_paid: number;
  platform_fee: number;
  producer_payout: number;
  status: PurchaseStatus;
  download_urls: Record<string, string> | null;
  download_expires_at: string | null;
  created_at: string;
  // Joined data
  beat?: Beat;
  license?: License;
  buyer?: Profile;
}

export interface ProducerStorefront {
  id: string;
  producer_id: string;
  slug: string;
  banner_url: string | null;
  logo_url: string | null;
  bio: string | null;
  social_links: Record<string, string> | null;
  theme_customization: Record<string, any> | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  producer?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  beat_id: string;
  created_at: string;
  // Joined data
  beat?: Beat;
}

export interface AnalyticsEvent {
  id: string;
  event_type: AnalyticsEventType;
  user_id: string | null;
  beat_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

// Waveform data structure
export interface WaveformData {
  peaks: number[];
  duration: number;
}

// Filter options
export interface BeatFilters {
  genre?: string;
  bpmMin?: number;
  bpmMax?: number;
  key?: string;
  priceMin?: number;
  priceMax?: number;
  moods?: string[];
  search?: string;
  isSyncReady?: boolean;
}

// Sort options
export type BeatSortOption = 'newest' | 'popular' | 'price_asc' | 'price_desc';

// Supabase Database type (generated from schema)
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      beats: {
        Row: Beat;
        Insert: Omit<Beat, 'id' | 'created_at' | 'updated_at' | 'play_count'>;
        Update: Partial<Omit<Beat, 'id' | 'producer_id' | 'created_at'>>;
      };
      licenses: {
        Row: License;
        Insert: Omit<License, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<License, 'id' | 'beat_id' | 'created_at'>>;
      };
      purchases: {
        Row: Purchase;
        Insert: Omit<Purchase, 'id' | 'created_at'>;
        Update: Partial<Omit<Purchase, 'id' | 'created_at'>>;
      };
      producer_storefronts: {
        Row: ProducerStorefront;
        Insert: Omit<ProducerStorefront, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ProducerStorefront, 'id' | 'producer_id' | 'created_at'>>;
      };
      favorites: {
        Row: Favorite;
        Insert: Omit<Favorite, 'id' | 'created_at'>;
        Update: never;
      };
      analytics_events: {
        Row: AnalyticsEvent;
        Insert: Omit<AnalyticsEvent, 'id' | 'created_at'>;
        Update: never;
      };
    };
  };
}
