export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          beat_id: string | null
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          beat_id?: string | null
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          beat_id?: string | null
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category: string
          content: string | null
          created_at: string
          excerpt: string | null
          featured: boolean | null
          id: string
          image_url: string | null
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured?: boolean | null
          id?: string
          image_url?: string | null
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_profiles_ext: {
        Row: {
          bio: string | null
          cover_image_url: string | null
          is_verified: boolean | null
          location: string | null
          press_photo_url: string | null
          profile_id: string
          social_links: Json | null
          stats: Json | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          cover_image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          press_photo_url?: string | null
          profile_id: string
          social_links?: Json | null
          stats?: Json | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          cover_image_url?: string | null
          is_verified?: boolean | null
          location?: string | null
          press_photo_url?: string | null
          profile_id?: string
          social_links?: Json | null
          stats?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_profiles_ext_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      artist_questionnaires: {
        Row: {
          artist_id: string | null
          created_at: string
          id: string
          responses: Json
          status: string | null
          updated_at: string
        }
        Insert: {
          artist_id?: string | null
          created_at?: string
          id?: string
          responses?: Json
          status?: string | null
          updated_at?: string
        }
        Update: {
          artist_id?: string | null
          created_at?: string
          id?: string
          responses?: Json
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "artist_questionnaires_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beats: {
        Row: {
          artwork_url: string | null
          audio_url: string
          bpm: number | null
          created_at: string | null
          description: string | null
          duration: number | null
          genre: string | null
          id: string
          key: string | null
          metadata: Json | null
          mood_tags: string[] | null
          play_count: number | null
          preview_url: string
          producer_id: string
          status: string | null
          stems_url: string | null
          title: string
          updated_at: string | null
          waveform_data: Json | null
        }
        Insert: {
          artwork_url?: string | null
          audio_url: string
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          mood_tags?: string[] | null
          play_count?: number | null
          preview_url: string
          producer_id: string
          status?: string | null
          stems_url?: string | null
          title: string
          updated_at?: string | null
          waveform_data?: Json | null
        }
        Update: {
          artwork_url?: string | null
          audio_url?: string
          bpm?: number | null
          created_at?: string | null
          description?: string | null
          duration?: number | null
          genre?: string | null
          id?: string
          key?: string | null
          metadata?: Json | null
          mood_tags?: string[] | null
          play_count?: number | null
          preview_url?: string
          producer_id?: string
          status?: string | null
          stems_url?: string | null
          title?: string
          updated_at?: string | null
          waveform_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "beats_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      charts: {
        Row: {
          artist_name: string
          chart_type: string | null
          created_at: string
          id: string
          image_url: string | null
          last_rank: number | null
          rank: number
          title: string
          week_start: string
        }
        Insert: {
          artist_name: string
          chart_type?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          last_rank?: number | null
          rank: number
          title: string
          week_start?: string
        }
        Update: {
          artist_name?: string
          chart_type?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          last_rank?: number | null
          rank?: number
          title?: string
          week_start?: string
        }
        Relationships: []
      }
      distribution_data: {
        Row: {
          asset_id: string | null
          country_code: string | null
          created_at: string
          dsp: string
          id: string
          period_end: string | null
          period_start: string | null
          revenue_usd: number | null
          stream_count: number | null
        }
        Insert: {
          asset_id?: string | null
          country_code?: string | null
          created_at?: string
          dsp: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          revenue_usd?: number | null
          stream_count?: number | null
        }
        Update: {
          asset_id?: string | null
          country_code?: string | null
          created_at?: string
          dsp?: string
          id?: string
          period_end?: string | null
          period_start?: string | null
          revenue_usd?: number | null
          stream_count?: number | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          beat_id: string
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          beat_id: string
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          beat_id?: string
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      licenses: {
        Row: {
          beat_id: string
          created_at: string | null
          files_included: string[] | null
          id: string
          is_active: boolean | null
          price: number
          terms: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          beat_id: string
          created_at?: string | null
          files_included?: string[] | null
          id?: string
          is_active?: boolean | null
          price: number
          terms?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          beat_id?: string
          created_at?: string | null
          files_included?: string[] | null
          id?: string
          is_active?: boolean | null
          price?: number
          terms?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licenses_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      merch_products: {
        Row: {
          base_cost: number | null
          category: string | null
          created_at: string
          id: string
          image_url: string | null
          inventory: number | null
          name: string
          price: number
          producer_id: string | null
          source: string | null
          status: string | null
          supplier_product_id: string | null
          variant_ids: Json | null
        }
        Insert: {
          base_cost?: number | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory?: number | null
          name: string
          price: number
          producer_id?: string | null
          source?: string | null
          status?: string | null
          supplier_product_id?: string | null
          variant_ids?: Json | null
        }
        Update: {
          base_cost?: number | null
          category?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory?: number | null
          name?: string
          price?: number
          producer_id?: string | null
          source?: string | null
          status?: string | null
          supplier_product_id?: string | null
          variant_ids?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "merch_products_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          phone: string | null
          first_name: string | null
          geolocation: Json | null
          id: string
          last_name: string | null
          metadata: Json | null
          owner_id: string | null
          source: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          phone?: string | null
          first_name?: string | null
          geolocation?: Json | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          owner_id?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          phone?: string | null
          first_name?: string | null
          geolocation?: Json | null
          id?: string
          last_name?: string | null
          metadata?: Json | null
          owner_id?: string | null
          source?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletters: {
        Row: {
          audience: string
          content: string
          created_at: string
          id: string
          metadata: Json | null
          sender_id: string | null
          sent_at: string | null
          status: string | null
          subject: string
        }
        Insert: {
          audience?: string
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject: string
        }
        Update: {
          audience?: string
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          sender_id?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          fulfillment_status: string | null
          id: string
          payment_intent_id: string | null
          payment_status: string | null
          producer_id: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          customer_email: string
          fulfillment_status?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          producer_id?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string
          customer_email?: string
          fulfillment_status?: string | null
          id?: string
          payment_intent_id?: string | null
          payment_status?: string | null
          producer_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: false
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_storefronts: {
        Row: {
          banner_url: string | null
          bio: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          producer_id: string
          slug: string
          social_links: Json | null
          theme_customization: Json | null
          updated_at: string | null
        }
        Insert: {
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          producer_id: string
          slug: string
          social_links?: Json | null
          theme_customization?: Json | null
          updated_at?: string | null
        }
        Update: {
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          producer_id?: string
          slug?: string
          social_links?: Json | null
          theme_customization?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producer_storefronts_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      producers: {
        Row: {
          branding: Json | null
          created_at: string
          id: string
          profile_id: string | null
          status: string | null
          store_slug: string
        }
        Insert: {
          branding?: Json | null
          created_at?: string
          id?: string
          profile_id?: string | null
          status?: string | null
          store_slug: string
        }
        Update: {
          branding?: Json | null
          created_at?: string
          id?: string
          profile_id?: string | null
          status?: string | null
          store_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "producers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          display_name: string | null
          email: string
          id: string
          role: string
          status: string | null
          stripe_connect_account_id: string | null
          stripe_onboarding_complete: boolean | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email: string
          id: string
          role: string
          status?: string | null
          stripe_connect_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string
          id?: string
          role?: string
          status?: string | null
          stripe_connect_account_id?: string | null
          stripe_onboarding_complete?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      pulse_data: {
        Row: {
          bass_energy: number[] | null
          beat_id: string | null
          bpm: number | null
          created_at: string
          id: string
          pulses: Json | null
          rms_loudness: number[] | null
          updated_at: string
        }
        Insert: {
          bass_energy?: number[] | null
          beat_id?: string | null
          bpm?: number | null
          created_at?: string
          id?: string
          pulses?: Json | null
          rms_loudness?: number[] | null
          updated_at?: string
        }
        Update: {
          bass_energy?: number[] | null
          beat_id?: string | null
          bpm?: number | null
          created_at?: string
          id?: string
          pulses?: Json | null
          rms_loudness?: number[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pulse_data_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: true
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
        ]
      }
      purchases: {
        Row: {
          amount_paid: number
          beat_id: string
          buyer_id: string
          created_at: string | null
          download_expires_at: string | null
          download_urls: Json | null
          id: string
          license_id: string
          platform_fee: number
          producer_payout: number
          status: string | null
          stripe_payment_intent_id: string
        }
        Insert: {
          amount_paid: number
          beat_id: string
          buyer_id: string
          created_at?: string | null
          download_expires_at?: string | null
          download_urls?: Json | null
          id?: string
          license_id: string
          platform_fee: number
          producer_payout: number
          status?: string | null
          stripe_payment_intent_id: string
        }
        Update: {
          amount_paid?: number
          beat_id?: string
          buyer_id?: string
          created_at?: string | null
          download_expires_at?: string | null
          download_urls?: Json | null
          id?: string
          license_id?: string
          platform_fee?: number
          producer_payout?: number
          status?: string | null
          stripe_payment_intent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_beat_id_fkey"
            columns: ["beat_id"]
            isOneToOne: false
            referencedRelation: "beats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "licenses"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          created_at: string
          id: string
          producer_id: string | null
          theme: Json | null
        }
        Insert: {
          created_at?: string
          id?: string
          producer_id?: string | null
          theme?: Json | null
        }
        Update: {
          created_at?: string
          id?: string
          producer_id?: string | null
          theme?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_producer_id_fkey"
            columns: ["producer_id"]
            isOneToOne: true
            referencedRelation: "producers"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          artist_id: string | null
          bio: string | null
          created_at: string
          genre: string
          id: string
          name: string
          release_url: string | null
          status: string | null
          tier: string | null
        }
        Insert: {
          artist_id?: string | null
          bio?: string | null
          created_at?: string
          genre: string
          id?: string
          name: string
          release_url?: string | null
          status?: string | null
          tier?: string | null
        }
        Update: {
          artist_id?: string | null
          bio?: string | null
          created_at?: string
          genre?: string
          id?: string
          name?: string
          release_url?: string | null
          status?: string | null
          tier?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_play_count: { Args: { beat_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
