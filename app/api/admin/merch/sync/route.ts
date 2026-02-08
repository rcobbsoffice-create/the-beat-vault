import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getFulfillmentProvider } from '@/lib/fulfillment';

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const apiKey = process.env.PRINTFUL_API_KEY;
    if (!apiKey) {
      throw new Error('PRINTFUL_API_KEY not configured');
    }

    const provider = getFulfillmentProvider('printful', apiKey);
    const products = await provider.getProducts();
    console.log(`[Sync API] Found ${products.length} products to sync`);


    // Sync to database
    for (const prod of products) {
      const { error } = await supabase
        .from('merch_products')
        .upsert({
          name: prod.name,
          price: prod.variants[0]?.price || 0,
          image_url: prod.image_url,
          source: 'printful',
          supplier_product_id: prod.external_id,

          variant_ids: prod.variants,
          status: 'published',
          category: 'Apparel',
          inventory: 100
        }, {
          onConflict: 'supplier_product_id'
        });

      if (error) console.error(`Error syncing product ${prod.name}:`, error);
    }

    return NextResponse.json({ success: true, count: products.length });
  } catch (error: any) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

