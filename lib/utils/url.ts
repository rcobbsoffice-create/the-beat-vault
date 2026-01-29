/**
 * Sanitizes URLs to handle common construction errors like 'undefined' segments
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return '';
  
  const R2_BASE = 'https://118d3f495ee79c8de7fe0a297e16b33d.r2.cloudflarestorage.com/beatvault';
  
  // Fix 'undefined/' segments in R2 URLs
  if (url.includes('undefined/')) {
    // If it's a relative path starting with undefined/ or /undefined/
    // or an absolute URL containing undefined/
    return url.replace(/^.*?undefined\//, `${R2_BASE}/`);
  }

  // If it's already a valid absolute URL, return it
  if (url.startsWith('http') || url.startsWith('/')) {
    return url;
  }

  return url;
}
