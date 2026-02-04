'use server';

import { createServiceClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createAdminUser(formData: {
  email: string;
  displayName: string;
  role: string;
  status: string;
}) {
  const { email, displayName, role, status } = formData;

  if (!email || !role) {
    throw new Error('Email and role are required');
  }

  // 1. Check if the current user is an admin
  const { createServerSupabaseClient } = await import('@/lib/supabase/server');
  const supabaseServer = await createServerSupabaseClient();
  const { data: { user: currentUser } } = await supabaseServer.auth.getUser();

  if (!currentUser) throw new Error('Unauthorized');

  const { data: profile } = await supabaseServer
    .from('profiles')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (profile?.role !== 'admin') {
    throw new Error('Forbidden: Admin access only');
  }

  // 2. Proceeed with service role
  const supabase = createServiceClient();

  // Create the auth user with the service role
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password: Math.random().toString(36).slice(-12), // Random password
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

  // Update status if needed
  if (status && status !== 'active') {
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', newUser.user.id);
    
    if (updateError) throw updateError;
  }

  revalidatePath('/dashboard/admin/users');
  return { success: true, user: newUser.user };
}
