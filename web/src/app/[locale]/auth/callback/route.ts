import { createClient } from '../../utils/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { logger } from '@/lib/logs/logger'

export async function GET(
  request: NextRequest,
{ params }: { params: Promise<{ locale: string }> }
) {
  // Extract authorization code from URL
  const { searchParams, origin } = new URL(request.url) // String to URL obj
  const { locale } = await params;

  // searchParams
  // URLSearchParams { 'code' => 'bdff58a2-8253-417d-b2ba-e398f889fc27' }
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // Exchange code for session
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // Redirect to home page on success
    if (!error) {
      logger.info(`[AUTH CALLBACK SUCCESS] Code exchanged for session`);
      // 언어 정보가 포함된 URL로 리다이렉트 (예: http://localhost:3000/en/)
      // 만약 next가 '/'라면 /en/ 가 됩니다.
      const finalRedirectUrl = new URL(`/${locale}${next}`, origin);
      return NextResponse.redirect(finalRedirectUrl)
    }
    logger.error(`[AUTH CALLBACK FAIL] Exchange failed | Msg:${error.message}`);
  } else {
    // In case google didn't send 'code' (user canceled or security issue)
    logger.warn(`[AUTH CALLBACK WARN] No code found in searchParams`);
  }
  
  // Redirect to error page on failure
  return NextResponse.redirect(`${origin}/${locale}/auth?error=auth_failed`)
}