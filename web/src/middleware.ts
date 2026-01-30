import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// i18n middeleware setup
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Create the base response by running the i18n middleware first.
  // At this stage, the URL will have /en or /fr appended, or locale cookies will be set.
  const response = intlMiddleware(request);

  // Create Supabase client with the response object to layer cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          cookiesToSet.forEach(({ name, value }) => response.cookies.set(name, value));
        },
      },
    }
  );

  // Check the session info (getUser is safe to call)
  const { data: { user } } = await supabase.auth.getUser();

  // Protected route logic (e.g., redirect unauthenticated users trying to access other pages)
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.includes('/auth');
  
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    // Redirect to the auth page while preserving the current language setting
    const locale = pathname.split('/')[1] || 'en';
    url.pathname = `/${locale}/auth`;
    return NextResponse.redirect(url);
  }

  // Return the final response with both i18n and Supabase cookies set
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}