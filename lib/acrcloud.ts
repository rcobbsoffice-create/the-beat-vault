import crypto from 'crypto';

/**
 * ACRCloud API Client for Audio Fingerprinting
 * Documentation: https://docs.acrcloud.com/
 */

interface ACRCloudConfig {
  accessKey: string;
  accessSecret: string;
  bucketId: string;
  host: string;
}

interface FingerprintResult {
  success: boolean;
  fingerprintId?: string;
  data?: any;
  error?: string;
}

interface MonitoringConfig {
  fingerprintId: string;
  platforms: string[]; // ['youtube', 'spotify', 'soundcloud', 'tiktok']
}

interface Detection {
  platform: string;
  platformUrl?: string;
  platformVideoId?: string;
  platformTitle?: string;
  platformCreator?: string;
  detectedAt: string;
  confidenceScore: number;
  durationSeconds?: number;
  metadata?: any;
}

/**
 * ACRCloud API Client
 */
export class ACRCloudClient {
  private config: ACRCloudConfig;

  constructor(config: ACRCloudConfig) {
    this.config = config;
  }

  /**
   * Generate signature for ACRCloud API requests
   */
  private generateSignature(
    method: string,
    uri: string,
    accessKey: string,
    accessSecret: string,
    timestamp: number
  ): string {
    const stringToSign = [method, uri, accessKey, 'audio', timestamp].join('\n');
    return crypto
      .createHmac('sha1', accessSecret)
      .update(Buffer.from(stringToSign, 'utf-8'))
      .digest()
      .toString('base64');
  }

  /**
   * Upload audio fingerprint to ACRCloud bucket
   * This registers the beat for monitoring
   */
  async uploadFingerprint(
    audioBuffer: Buffer,
    metadata: {
      title: string;
      artist?: string;
      album?: string;
      customId: string; // Our beat ID
    }
  ): Promise<FingerprintResult> {
    try {
      const timestamp = Date.now();
      const signature = this.generateSignature(
        'POST',
        '/v1/fingerprints',
        this.config.accessKey,
        this.config.accessSecret,
        timestamp
      );

      const formData = new FormData();
      formData.append('access_key', this.config.accessKey);
      formData.append('signature', signature);
      formData.append('signature_version', '1');
      formData.append('timestamp', timestamp.toString());
      formData.append('data_type', 'audio');
      formData.append('bucket_id', this.config.bucketId);
      
      // Audio file
      const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
      formData.append('sample', audioBlob, 'audio.wav');
      
      // Metadata
      formData.append('title', metadata.title);
      if (metadata.artist) formData.append('artist', metadata.artist);
      if (metadata.album) formData.append('album', metadata.album);
      formData.append('custom_id', metadata.customId);

      const response = await fetch(`https://${this.config.host}/v1/fingerprints`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status?.code === 0) {
        return {
          success: true,
          fingerprintId: result.data?.fingerprint_id,
          data: result.data,
        };
      } else {
        return {
          success: false,
          error: result.status?.msg || 'Unknown error',
        };
      }
    } catch (error: any) {
      console.error('ACRCloud upload error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Enable monitoring for a fingerprint across specified platforms
   */
  async enableMonitoring(config: MonitoringConfig): Promise<{ success: boolean; error?: string }> {
    try {
      const timestamp = Date.now();
      const signature = this.generateSignature(
        'POST',
        '/v1/monitoring/enable',
        this.config.accessKey,
        this.config.accessSecret,
        timestamp
      );

      const response = await fetch(`https://${this.config.host}/v1/monitoring/enable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: this.config.accessKey,
          signature,
          signature_version: '1',
          timestamp,
          fingerprint_id: config.fingerprintId,
          platforms: config.platforms,
          bucket_id: this.config.bucketId,
        }),
      });

      const result = await response.json();

      if (result.status?.code === 0) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.status?.msg || 'Failed to enable monitoring',
        };
      }
    } catch (error: any) {
      console.error('ACRCloud enable monitoring error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Disable monitoring for a fingerprint
   */
  async disableMonitoring(fingerprintId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const timestamp = Date.now();
      const signature = this.generateSignature(
        'POST',
        '/v1/monitoring/disable',
        this.config.accessKey,
        this.config.accessSecret,
        timestamp
      );

      const response = await fetch(`https://${this.config.host}/v1/monitoring/disable`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_key: this.config.accessKey,
          signature,
          signature_version: '1',
          timestamp,
          fingerprint_id: fingerprintId,
          bucket_id: this.config.bucketId,
        }),
      });

      const result = await response.json();

      if (result.status?.code === 0) {
        return { success: true };
      } else {
        return {
          success: false,
          error: result.status?.msg || 'Failed to disable monitoring',
        };
      }
    } catch (error: any) {
      console.error('ACRCloud disable monitoring error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Query detections for a fingerprint within a date range
   */
  async queryDetections(
    fingerprintId: string,
    dateRange: { from: Date; to: Date }
  ): Promise<{ success: boolean; detections?: Detection[]; error?: string }> {
    try {
      const timestamp = Date.now();
      const uri = '/v1/monitoring/detections';
      const signature = this.generateSignature(
        'GET',
        uri,
        this.config.accessKey,
        this.config.accessSecret,
        timestamp
      );

      const params = new URLSearchParams({
        access_key: this.config.accessKey,
        signature,
        signature_version: '1',
        timestamp: timestamp.toString(),
        fingerprint_id: fingerprintId,
        bucket_id: this.config.bucketId,
        start_date: dateRange.from.toISOString().split('T')[0],
        end_date: dateRange.to.toISOString().split('T')[0],
      });

      const response = await fetch(`https://${this.config.host}${uri}?${params.toString()}`, {
        method: 'GET',
      });

      const result = await response.json();

      if (result.status?.code === 0 && result.data) {
        // Transform ACRCloud detection format to our format
        const detections: Detection[] = (result.data.detections || []).map((d: any) => ({
          platform: d.platform,
          platformUrl: d.url,
          platformVideoId: d.video_id || d.track_id,
          platformTitle: d.title,
          platformCreator: d.creator || d.channel,
          detectedAt: d.detected_at,
          confidenceScore: d.score || 0,
          durationSeconds: d.duration,
          metadata: d,
        }));

        return {
          success: true,
          detections,
        };
      } else {
        return {
          success: false,
          error: result.status?.msg || 'Failed to query detections',
        };
      }
    } catch (error: any) {
      console.error('ACRCloud query detections error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

/**
 * Get configured ACRCloud client instance
 */
export function getACRCloudClient(): ACRCloudClient {
  const config: ACRCloudConfig = {
    accessKey: process.env.ACRCLOUD_ACCESS_KEY || '',
    accessSecret: process.env.ACRCLOUD_ACCESS_SECRET || '',
    bucketId: process.env.ACRCLOUD_BUCKET_ID || '',
    host: process.env.ACRCLOUD_HOST || 'identify-us-west-2.acrcloud.com',
  };

  if (!config.accessKey || !config.accessSecret || !config.bucketId) {
    throw new Error('ACRCloud configuration is incomplete. Please set environment variables.');
  }

  return new ACRCloudClient(config);
}
