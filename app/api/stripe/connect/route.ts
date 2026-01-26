import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createConnectAccount, createAccountLink } from '@/lib/stripe';

// Create Stripe Connect account for producer
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    // Get user from session
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const profileData = profile as any;

    if (profileData.role !== 'producer') {
      return NextResponse.json({ error: 'Only producers can connect Stripe' }, { status: 403 });
    }

    // Check if already has Connect account
    if (profileData.stripe_connect_account_id) {
      // Generate new account link for existing account
      const accountLink = await createAccountLink(
        profileData.stripe_connect_account_id,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/producer?stripe=success`,
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/producer?stripe=refresh`
      );
      
      return NextResponse.json({ url: accountLink.url });
    }

    // Create new Connect account
    const account = await createConnectAccount(profileData.email, user.id);

    // Save account ID to profile
    await (supabase
      .from('profiles') as any)
      .update({ stripe_connect_account_id: account.id })
      .eq('id', user.id);

    // Generate account link for onboarding
    const accountLink = await createAccountLink(
      account.id,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/producer?stripe=success`,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/producer?stripe=refresh`
    );

    return NextResponse.json({ url: accountLink.url });
  } catch (error: any) {
    console.error('Stripe Connect error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create Connect account' },
      { status: 500 }
    );
  }
}

// Get Connect account status
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_connect_account_id, stripe_onboarding_complete')
      .eq('id', user.id)
      .single();

    const profileData = profile as any;

    if (!profileData?.stripe_connect_account_id) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      accountId: profileData.stripe_connect_account_id,
      onboardingComplete: profileData.stripe_onboarding_complete,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
