import { format } from 'date-fns';

export interface LicenseData {
  beatTitle: string;
  producerName: string;
  artistName: string;
  licenseType: 'basic' | 'premium' | 'exclusive' | 'sync';
  price: number;
  date: Date;
  isrc?: string;
  upc?: string;
  label?: string;
  publisher?: string;
}

export function generateLicenseMarkdown(data: LicenseData): string {
  const { 
    beatTitle, 
    producerName, 
    artistName, 
    licenseType, 
    price, 
    date,
    isrc,
    upc,
    label,
    publisher 
  } = data;

  const typeLabels = {
    basic: 'Basic (MP3)',
    premium: 'Premium (WAV)',
    exclusive: 'Exclusive (Ownership)',
    sync: 'Sync Licensing (Commercial)',
  };

  return `
# MUSIC LICENSE AGREEMENT (Rights-Locked)

**Date:** ${format(date, 'PPPP')}
**License Number:** AG-${Math.random().toString(36).substring(7).toUpperCase()}

## 1. PARTIES
This agreement is between **${producerName}** (the "Producer") and **${artistName}** (the "Artist").

## 2. ASSET DETAILS
- **Track Title:** ${beatTitle}
- **License Type:** ${typeLabels[licenseType]}
- **Transaction Amount:** $${(price / 100).toFixed(2)}
${label ? `- **Record Label:** ${label}` : ''}
${publisher ? `- **Publisher:** ${publisher}` : ''}
${isrc ? `- **ISRC:** ${isrc}` : ''}
${upc ? `- **UPC:** ${upc}` : ''}

## 3. GRANT OF RIGHTS
The Producer hereby grants the Artist a ${licenseType === 'exclusive' ? 'exclusive' : 'non-exclusive'} license to use the Track for the purposes defined in the ${typeLabels[licenseType]} terms.

${licenseType === 'sync' ? `
### 3.1 SYNC ADDENDUM
This license includes a AudioGenes Programmatic Sync Authorization, allowing the Track to be used in Film, TV, and Advertising placements via the AudioGenes API infrastructure.
` : ''}

## 4. ROYALTY SPLITS
Unless otherwise specified, following standard AudioGenes rights-locked protocols:
- **Mechanicals:** 50/50 split between Producer and Artist.
- **Sync Fees:** 50/50 split (if applicable).
- **Public Performance:** Standard PRO registration required.

## 5. TERRITORY
Universal (all platforms and regions).

---
*Generated via AudioGenes - Unified Music Infrastructure.*
  `.trim();
}
