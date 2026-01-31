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
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // IMPORTANT: Avoid calling supabase.auth.getSession() in middleware
  // as it can lead to session corruption. Using getUser() is safer.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/signup');
  
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // Redirect to login if accessing dashboard without session
  if (isDashboard && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Optimize: Fetch profile ONLY if we have a user and need it (Auth pages or Dashboard)
  let profile = null;
  if (user && (isAuthPage || isDashboard)) {
     const { data } = await supabase
       .from('profiles')
       .select('role')
       .eq('id', user.id)
       .single();
     profile = data;
  }

  // Redirect logged-in users away from auth pages to their specific dashboard
  if (isAuthPage && user) {
     if (profile?.role === 'admin') return NextResponse.redirect(new URL('/dashboard/admin', request.url));
     if (profile?.role === 'producer') return NextResponse.redirect(new URL('/dashboard/producer/beats', request.url));
     if (profile?.role === 'artist') return NextResponse.redirect(new URL('/dashboard/artist/library', request.url));
     // Fallback if role is missing or unknown
     return NextResponse.redirect(new URL('/dashboard/artist/library', request.url));
  }

  // Role-based access control for dashboard routes
  if (isDashboard && user) {
    const isProducerRoute = request.nextUrl.pathname.startsWith('/dashboard/producer');
    const isArtistRoute = request.nextUrl.pathname.startsWith('/dashboard/artist');
    const isAdminRoute = request.nextUrl.pathname.startsWith('/dashboard/admin');

    // Protect producer routes
    if (isProducerRoute && profile?.role !== 'producer' && profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/artist/library', request.url));
    }

    // Protect artist routes
    if (isArtistRoute && profile?.role !== 'artist' && profile?.role !== 'admin') {
       // Allow producers to see artist view? Usually yes, but strict RBAC might block.
       // For now, redirect to their home.
       if (profile?.role === 'producer') return NextResponse.redirect(new URL('/dashboard/producer/beats', request.url));
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
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images) - Optional, depends on project structure
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
