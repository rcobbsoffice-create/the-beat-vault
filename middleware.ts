import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.delete(name);
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.delete(name);
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect to login if accessing dashboard without session
  if (isDashboard && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Redirect to dashboard if accessing auth pages with active session
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Role-based access control for dashboard routes
  if (session && isDashboard) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    const isProducerRoute = request.nextUrl.pathname.startsWith('/dashboard/producer');
    const isArtistRoute = request.nextUrl.pathname.startsWith('/dashboard/artist');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');

    // Protect producer routes
    if (isProducerRoute && profile?.role !== 'producer' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect artist routes
    if (isArtistRoute && profile?.role !== 'artist' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Protect admin routes
    if (isAdminRoute && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/onboarding',
  ],
};
