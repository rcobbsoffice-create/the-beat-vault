import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, displayName, role, status } = body;

    if (!email || !role) {
      return NextResponse.json({ error: 'Email and role are required' }, { status: 400 });
    }

    const authHeader = request.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = createServiceClient();
    const token = authHeader.replace('Bearer ', '');
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !adminUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Check if requester is admin
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', adminUser.id)
      .single();

    if (adminError || adminProfile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access only' }, { status: 403 });
    }

    // Use admin API to create the user
    // This will create the auth user AND trigger the 'handle_new_user' DB function 
    // which creates the profile record.
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password: crypto.randomUUID(), // Temporary random password
      email_confirm: true,
      user_metadata: {
        display_name: displayName || email.split('@')[0],
        role: role
      }
    });

    if (createError) {
      console.error('Supabase admin create user error:', createError);
      throw createError;
    }

    // Optional: Update the status if it's not 'active' (default)
    if (status && status !== 'active') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', newUser.user.id);
      
      if (updateError) throw updateError;
    }

    return NextResponse.json({ 
      success: true, 
      user: newUser.user,
      message: 'User created successfully. They can reset their password via the forgot password flow.'
    });

  } catch (error: any) {
    console.error('Admin Create User Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
