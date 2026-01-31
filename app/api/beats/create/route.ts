import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      beatId,
      title, 
      description, 
      genre, 
      bpm, 
      key, 
      mood_tags,
      is_sync_ready,
      audio_url,
      preview_url,
      artwork_url,
      stems_url,
      licenses 
    } = body;

    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Check Role & Producer ID
    let finalProducerId = user.id;

    // Check if user is admin and if they provided a specific producerId
    if (body.producerId && body.producerId !== user.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (profile?.role === 'admin') {
            finalProducerId = body.producerId;
            console.log('Admin override: Creating beat for producer', finalProducerId);
        } else {
            console.warn('Unauthorized attempt to set producerId by non-admin user', user.id);
            // Fallback to user.id or block? Plan said "force producer_id = user.id" which implies fallback/ignore
        }
    }

    // 2. Create Beat record
    const beatData = {
      id: beatId || crypto.randomUUID(),
      producer_id: finalProducerId,
      title,
      description,
      genre,
      mood_tags,
      bpm: parseInt(bpm),
      key,
      audio_url,
      preview_url,
      artwork_url,
      stems_url,
      status: 'published'
    };

    console.log('Attempting to insert beat:', beatData);

    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .insert(beatData)
      .select()
      .single();

    if (beatError) {
      console.error('Supabase beat insert error:', beatError);
      throw beatError;
    }

    // 2. Create License records
    const licenseRecords = Object.entries(licenses)
      .filter(([_, config]: [string, any]) => config.enabled)
      .map(([type, config]: [string, any]) => ({
        beat_id: beat.id,
        type,
        price: Math.round(config.price * 100), // Store in cents
        is_active: true
      }));

    if (licenseRecords.length > 0) {
      const { error: licenseError } = await supabase
        .from('licenses')
        .insert(licenseRecords);
      if (licenseError) throw licenseError;
    }

    return NextResponse.json({ success: true, beatId: beat.id });
  } catch (error: any) {
    console.error('Beat Creation Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
