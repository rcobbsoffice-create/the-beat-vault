import { IFulfillmentProvider, FulfillmentProduct, FulfillmentOrder } from './types';

export class PrintfulProvider implements IFulfillmentProvider {
  private apiKey: string;
  private baseUrl = 'https://api.printful.com';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createProduct(name: string, designUrl: string): Promise<FulfillmentProduct> {
    console.log(`[Printful] Creating product: ${name} with design: ${designUrl}`);
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      external_id: 'pf_prod_' + Math.random().toString(36).substr(2, 9),
      name: name,
      variants: [
        { external_id: 'pf_var_1', name: 'Small', price: 15.50 },
        { external_id: 'pf_var_2', name: 'Medium', price: 15.50 },
        { external_id: 'pf_var_3', name: 'Large', price: 15.50 }
      ]
    };
  }

  async createOrder(recipient: any, items: any[]): Promise<FulfillmentOrder> {
    console.log(`[Printful] Creating order for: ${recipient.email}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    return {
      external_id: 'pf_ord_' + Math.random().toString(36).substr(2, 9),
      status: 'processing'
    };
  }

  async getTracking(orderId: string): Promise<string | null> {
    return 'TRK' + Math.random().toString(36).toUpperCase().substr(2, 8);
  }
}
