import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { beatId, action } = body; // action: 'approve' | 'reject'

    if (!beatId || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

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

    const newStatus = action === 'approve' ? 'published' : 'rejected';

    const { error: updateError } = await supabase
      .from('beats')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', beatId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error: any) {
    console.error('Admin Moderate Beat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
