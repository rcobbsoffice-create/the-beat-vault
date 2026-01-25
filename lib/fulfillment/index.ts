import { PrintfulProvider } from './printful';
import { IFulfillmentProvider } from './types';

export * from './types';

export function getFulfillmentProvider(service: string, apiKey: string): IFulfillmentProvider {
  switch (service.toLowerCase()) {
    case 'printful':
      return new PrintfulProvider(apiKey);
    default:
      throw new Error(`Unsupported fulfillment service: ${service}`);
  }
}
