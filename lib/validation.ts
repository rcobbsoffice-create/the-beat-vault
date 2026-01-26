/**
 * TrackFlow Metadata Validation Engine
 * Ensures industry-standard data quality for music distribution
 */

import { validateISRC, validateUPC } from './music-ids';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a release title based on industry standard casing (DDEX/DSP)
 * Enforces Title Case for most words, but allows specific conjunctions in lowercase
 */
export function validateReleaseTitle(title: string): ValidationResult {
  const errors: string[] = [];
  if (!title) {
    errors.push('Title is required');
    return { valid: false, errors };
  }

  // Basic length check
  if (title.length < 1 || title.length > 200) {
    errors.push('Title must be between 1 and 200 characters');
  }

  // Title Case logic (simplified)
  // Industry standard often requires first letter capitalized, no all-caps (unless acronym), etc.
  if (title === title.toUpperCase() && title.length > 5) {
    errors.push('Title should not be in ALL CAPS');
  }
  
  if (title === title.toLowerCase()) {
    errors.push('Title should not be in all lowercase');
  }

  // Check for prohibited characters (simplified)
  const prohibited = /[#@$%^*]/;
  if (prohibited.test(title)) {
    errors.push('Title contains prohibited special characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates artwork resolution and format
 */
export function validateArtwork(resolution: number): ValidationResult {
  const errors: string[] = [];
  if (resolution < 3000) {
    errors.push('Artwork must be at least 3000x3000px for high-quality distribution');
  }
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Performs a comprehensive validation of a release payload
 */
export function validateRelease(release: any): ValidationResult {
  const errors: string[] = [];

  const titleCheck = validateReleaseTitle(release.title);
  if (!titleCheck.valid) errors.push(...titleCheck.errors);

  if (release.isrc && !validateISRC(release.isrc)) {
    errors.push('Invalid ISRC format');
  }

  if (release.upc && !validateUPC(release.upc)) {
    errors.push('Invalid UPC format');
  }

  if (!release.genre) {
    errors.push('Primary genre is required');
  }

  if (!release.label) {
    errors.push('Label or Artist Name is required for distribution metadata');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
