import { createClient } from '@/app/utils/supabase/server'
import { NextResponse, NextRequest } from 'next/server'
import { logger } from '@/lib/logs/logger'

export async function GET(request: NextRequest) {
  // Extract authorization code from URL
  const { searchParams, origin } = new URL(request.url) // String to URL obj

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
      return NextResponse.redirect(`${origin}${next}`)
    }
    logger.error(`[AUTH CALLBACK FAIL] Exchange failed | Msg:${error.message}`);
  } else {
    // In case google didn't send 'code' (user canceled or security issue)
    logger.warn(`[AUTH CALLBACK WARN] No code found in searchParams`);
  }
  
  // Redirect to error page on failure
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}