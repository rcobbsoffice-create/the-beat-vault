import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }

    // Fetch pending beats with producer info
    const { data: beats, error: beatsError } = await supabase
      .from('beats')
      .select('*, producer:profiles!beats_producer_id_fkey(display_name, email)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (beatsError) throw beatsError;

    return NextResponse.json(beats);
  } catch (error: any) {
    console.error('Admin Fetch Beats Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
