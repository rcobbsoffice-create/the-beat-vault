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

    // Fetch all users
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (usersError) throw usersError;

    // Calculate Stats
    const totalUsers = users.length;
    const producers = users.filter(u => u.role === 'producer').length;
    const artists = users.filter(u => u.role === 'artist').length;
    const pendingVerifications = users.filter(u => u.role === 'producer' && u.status === 'active').length; // Logic: Producers who aren't 'verified' yet

    // Simple weekly growth calculation (stub for now, but could be done with date filtering)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const newThisWeek = users.filter(u => new Date(u.created_at) > oneWeekAgo).length;

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        producers,
        artists,
        pendingVerifications,
        newThisWeek
      }
    });
  } catch (error: any) {
    console.error('Admin Fetch Users Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
