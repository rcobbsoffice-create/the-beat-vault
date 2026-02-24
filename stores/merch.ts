import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: 'Apparel' | 'Accessories' | 'Physical Media' | 'Other';
  on_sale: boolean;
  external_link?: string;
  source: 'Manual' | 'Printful' | 'Printify';
}

interface MerchState {
  items: MerchItem[];
  isIntegrationConnected: boolean;
  connectedService: 'Printful' | 'Printify' | null;
  
  // Actions
  addItem: (item: MerchItem) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<MerchItem>) => void;
  setIntegration: (service: 'Printful' | 'Printify' | null, connected: boolean) => void;
  clearItems: () => void;
}

const INITIAL_MERCH: MerchItem[] = [
  {
    id: 'm1',
    name: 'Vault Logo Tee',
    description: 'Premium heavyweight cotton t-shirt with signature Vault logo.',
    price: 35.00,
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop&q=60',
    category: 'Apparel',
    on_sale: true,
    source: 'Manual'
  },
  {
    id: 'm2',
    name: 'Midnight Dreams Hoodie',
    description: 'Cozy fleece hoodie inspired by the Midnight Dreams beat tape.',
    price: 65.00,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&auto=format&fit=crop&q=60',
    category: 'Apparel',
    on_sale: true,
    source: 'Manual'
  }
];

export const useMerchStore = create<MerchState>()(
  persist(
    (set) => ({
      items: INITIAL_MERCH,
      isIntegrationConnected: false,
      connectedService: null,
      
      addItem: (item) => set((state) => ({ items: [...state.items, item] })),
      
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((item) => item.id !== id) 
      })),
      
      updateItem: (id, updates) => set((state) => ({
        items: state.items.map((item) => item.id === id ? { ...item, ...updates } : item)
      })),
      
      setIntegration: (service, connected) => set({ 
        connectedService: service, 
        isIntegrationConnected: connected 
      }),
      
      clearItems: () => set({ items: [] }),
    }),
    {
      name: 'producer-merch-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
