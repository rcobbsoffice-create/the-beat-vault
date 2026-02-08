import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
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

    // Get the user's email first
    const { data: targetUser, error: fetchError } = await supabase.auth.admin.getUserById(userId);
    if (fetchError || !targetUser.user) throw new Error('User not found');

    const email = targetUser.user.email;
    if (!email) throw new Error('User has no email address');

    // Trigger reset password email
    // Note: In Supabase admin context, we use the service role to send the reset email
    const { error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard/settings`
      }
    });
    
    // Alternatively, if we just want to send the standard email instead of getting the link:
    // supabase.auth.resetPasswordForEmail(email)
    // But since we are already in an admin-protected route with service role, 
    // sending the link/email is straightforward.
    
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${new URL(request.url).origin}/auth/callback?next=/dashboard/settings`
    });

    if (sendError) throw sendError;

    return NextResponse.json({ success: true, message: `Reset email sent to ${email}` });
  } catch (error: any) {
    console.error('Admin Reset Password Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
