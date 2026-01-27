/**
 * ArtistFlow AI Sync Scoring Engine
 * Analyzes track metadata and structure to determine sync licensing potential.
 */

export interface SyncScore {
  total: number; // 0-100
  categories: {
    production: number;
    commercialAppeal: number;
    metadataQuality: number;
    uniqueness: number;
  };
  recommendations: string[];
}

/**
 * Calculates a mock sync score based on track metadata.
 * In production, this would integrate with an LLM or audio analysis tool.
 */
export function calculateSyncScore(beat: any): SyncScore {
  let production = 85; // Base high production value
  let commercialAppeal = 0;
  let metadataQuality = 0;
  let uniqueness = 75;

  const recommendations: string[] = [];

  // Metadata quality check
  if (beat.isrc) metadataQuality += 25;
  if (beat.label) metadataQuality += 25;
  if (beat.publisher) metadataQuality += 25;
  if (beat.genre && beat.mood_tags?.length > 2) metadataQuality += 25;

  if (metadataQuality < 75) {
    recommendations.push("Enhance metadata tags and publisher info to increase discoverability.");
  }

  // Commercial appeal based on BPM and Genre
  if (beat.bpm >= 120 && beat.bpm <= 130) commercialAppeal += 40; // High energy sweet spot
  if (['Pop', 'Electronic', 'Trap'].includes(beat.genre)) commercialAppeal += 40;
  commercialAppeal += 20;

  // Total score weighted
  const total = Math.round(
    (production * 0.3) + 
    (commercialAppeal * 0.3) + 
    (metadataQuality * 0.25) + 
    (uniqueness * 0.15)
  );

  if (total > 80) {
    recommendations.push("High sync potential. Submit to the premium partner catalog.");
  }

  return {
    total,
    categories: {
      production,
      commercialAppeal,
      metadataQuality,
      uniqueness
    },
    recommendations
  };
}
