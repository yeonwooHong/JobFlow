import { type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// 1. i18n 미들웨어 설정
const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // A. 먼저 i18n 미들웨어를 실행하여 기본 응답(Response) 객체를 생성합니다.
  // 이 단계에서 URL에 /en 이나 /fr이 붙거나 로케일 쿠키가 설정됩니다.
  const response = intlMiddleware(request);

  // B. Supabase 클라이언트를 생성합니다. 
  // 이때 위에서 만든 'response' 객체를 넘겨서 쿠키가 그 위에 쌓이도록 합니다.
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

  // C. 세션 정보를 확인합니다 (getUser가 안전함).
  const { data: { user } } = await supabase.auth.getUser();

  // D. 보호된 경로 로직 (예: 로그인 안 된 사용자가 /auth 외의 페이지 접근 시)
  const pathname = request.nextUrl.pathname;
  
  // 정적 파일이나 API 경로는 제외하고 체크
  const isAuthPage = pathname.includes('/auth');
  
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    // 현재 접속한 언어를 유지하며 로그인 페이지로 리다이렉트
    const locale = pathname.split('/')[1] || 'en';
    url.pathname = `/${locale}/auth`;
    return NextResponse.redirect(url);
  }

  // E. i18n 정보와 Supabase 쿠키가 모두 담긴 최종 response 반환
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