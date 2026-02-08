import { IFulfillmentProvider, FulfillmentProduct, FulfillmentOrder } from './types';

export class PrintfulProvider implements IFulfillmentProvider {
  private apiKey: string;
  private baseUrl = 'https://api.printful.com';
  private storeId: string | null = null;

  constructor(apiKey: string, storeId?: string) {
    this.apiKey = apiKey;
    this.storeId = storeId || null;
  }

  private async ensureStoreId() {
    if (this.storeId) return;

    console.log('[Printful] Store ID missing, auto-detecting stores...');
    try {
      // Use a direct fetch to avoids the header check logic in this.fetch
      const response = await fetch(`${this.baseUrl}/stores`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        this.storeId = data.result[0].id.toString();
        console.log(`[Printful] Auto-detected Store: ${data.result[0].name} (ID: ${this.storeId})`);
      } else {
        console.error('[Printful] No stores found in account. Data:', JSON.stringify(data));
        throw new Error('No stores found in this Printful account. Please create a store first.');
      }
    } catch (error: any) {
      console.error('[Printful] Failed to auto-detect store:', error);
      throw new Error(`Printful Authorization Failed: ${error.message}`);
    }
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    // Ensure we have a store ID for all non-store-listing requests
    if (endpoint !== '/stores' && !this.storeId) {
      await this.ensureStoreId();
    }

    const headers: any = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.storeId) {
      headers['X-PF-Store-Id'] = this.storeId;
    }

    console.log(`[Printful] API Request: ${endpoint} ${this.storeId ? `(Store: ${this.storeId})` : ''}`);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Printful API error: ${response.statusText}`);
    }

    return response.json();
  }

  async createProduct(name: string, designUrl: string): Promise<FulfillmentProduct> {
    // In a real Printful implementation, this involves creating a sync product 
    // and matching it with a catalog product. Keeping it simplified for now.
    throw new Error('Real product creation via design URL requires specific Printful Sync API implementation');
  }

  async createOrder(recipient: any, items: any[]): Promise<FulfillmentOrder> {
    await this.ensureStoreId();
    const data = await this.fetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        recipient,
        items: items.map(item => ({
          sync_variant_id: item.variant_id,
          quantity: item.quantity
        }))
      })
    });

    return {
      external_id: data.result.id.toString(),
      status: data.result.status
    };
  }

  async getTracking(orderId: string): Promise<string | null> {
    try {
      const data = await this.fetch(`/orders/${orderId}`);
      return data.result.shipments?.[0]?.tracking_number || null;
    } catch (error) {
      console.error('[Printful] Tracking error:', error);
      return null;
    }
  }

  async createStore(name: string): Promise<{ id: string; name: string }> {
    const data = await this.fetch('/stores', {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    return {
      id: data.result.id.toString(),
      name: data.result.name
    };
  }

  async getProducts(): Promise<FulfillmentProduct[]> {
    console.log('[Printful] Syncing live products...');
    await this.ensureStoreId();
    
    const data = await this.fetch('/store/products');
    const syncProducts = data.result || [];

    const products: FulfillmentProduct[] = [];
    console.log(`[Printful] Found ${syncProducts.length} base products. Fetching variants...`);

    // Printful "list products" doesn't return variants, so we fetch details for each
    for (const sp of syncProducts) {
      try {
        const details = await this.fetch(`/store/products/${sp.id}`);
        const variants = (details.result.sync_variants || []).map((v: any) => ({
          external_id: v.external_id || v.id.toString(),
          name: v.name,
          price: parseFloat(v.retail_price)
        }));

        products.push({
          external_id: sp.external_id || sp.id.toString(),
          name: sp.name,
          image_url: sp.thumbnail_url,
          variants
        });
      } catch (err) {
        console.error(`[Printful] Error fetching details for product ${sp.id}:`, err);
      }
    }

    return products;
  }
}


