import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { uploadToR2 } from '@/lib/r2';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `avatars/${session.user.id}/${crypto.randomUUID()}.${fileExtension}`;
    
    // Upload to R2
    const publicUrl = await uploadToR2(fileName, buffer, file.type);

    // Update profile in Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', session.user.id);

    if (updateError) {
      console.error('Error updating avatar URL in DB:', updateError);
      return NextResponse.json({ error: 'Failed to update profile picture in database' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      avatarUrl: publicUrl,
      message: 'Profile picture updated successfully' 
    });

  } catch (error: any) {
    console.error('Avatar Upload API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
