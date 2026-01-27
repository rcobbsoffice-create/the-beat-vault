import { supabase } from './client';

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author_id: string;
  category: string;
  image_url: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  published_at: string;
  profiles?: {
    display_name: string;
  };
};

export type ChartEntry = {
  id: string;
  rank: number;
  last_rank: number;
  title: string;
  artist_name: string;
  image_url: string;
  chart_type: 'top_100' | 'trending' | 'genre' | 'viral';
};

export type ArtistExtension = {
  profile_id: string;
  bio: string;
  press_photo_url: string;
  cover_image_url: string;
  location: string;
  social_links: any;
  stats: any;
  is_verified: boolean;
  profiles?: {
    display_name: string;
    avatar_url: string;
  };
};

export const magazineService = {
  async getArticles(limit = 10, featuredOnly = false, category?: string) {
    let query = supabase
      .from('articles')
      .select('*, profiles(display_name)')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (featuredOnly) {
      query = query.eq('featured', true);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getArticleBySlug(slug: string) {
    const { data, error } = await supabase
      .from('articles')
      .select('*, profiles(display_name)')
      .eq('slug', slug)
      .single();

    if (error) throw error;
    return data;
  },

  async getCharts(type: ChartEntry['chart_type'] = 'top_100', limit = 10) {
    const { data, error } = await supabase
      .from('charts')
      .select('*')
      .eq('chart_type', type)
      .order('rank', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data;
  },

  async getArtistExtension(profileId: string) {
    const { data, error } = await supabase
      .from('artist_profiles_ext')
      .select('*, profiles(display_name, avatar_url)')
      .eq('profile_id', profileId)
      .single();

    if (error) return null;
    return data;
  },

  async getArtistBySlug(slug: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, artist_profiles_ext(*)')
      .ilike('display_name', `%${slug.replace(/-/g, ' ')}%`)
      .single();

    if (error) return null;
    return data;
  },

  async submitArtistApplication(submission: any) {
    const { data, error } = await supabase
      .from('submissions')
      .insert(submission)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};
