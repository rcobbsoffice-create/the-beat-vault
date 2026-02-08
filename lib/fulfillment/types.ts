export interface FulfillmentProduct {
  external_id: string;
  name: string;
  image_url?: string;
  variants: FulfillmentVariant[];
}


export interface FulfillmentVariant {
  external_id: string;
  name: string;
  price: number;
}

export interface FulfillmentOrder {
  external_id: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  tracking_number?: string;
}

export interface FulfillmentStore {
  id: string;
  name: string;
  website?: string;
}


export interface IFulfillmentProvider {
  createProduct(name: string, designUrl: string): Promise<FulfillmentProduct>;
  createOrder(recipient: any, items: any[]): Promise<FulfillmentOrder>;
  getTracking(orderId: string): Promise<string | null>;
  createStore(name: string): Promise<FulfillmentStore>;
  getProducts(): Promise<FulfillmentProduct[]>;
}


