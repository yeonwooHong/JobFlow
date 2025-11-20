import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  // 1. Extract authorization code from URL

  // searchParams
  // URLSearchParams { 'code' => 'bdff58a2-8253-417d-b2ba-e398f889fc27' }
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    // 2. Exchange code for session
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // 3. Redirect to home page on success
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }
  
  // 4. Redirect to error page on failure
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
}