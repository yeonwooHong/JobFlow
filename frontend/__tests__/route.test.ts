// Flow n Mocking
// 1. User logs in Google's redirect URL and
// Google redirects back to my callback URL with an authorization code -> Mock
// 2. route.js checks it and sends page.tsx

import { GET } from '@/app/auth/callback/route'
import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

// Mock dependencies
jest.mock('@/app/utils/supabase/server')
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url: string) => ({ type: 'redirect', url })),
  },
}))

describe('GET /auth/callback', () => {
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>
  const mockRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should redirect to home on successful authentication', async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({
          error: null,
        }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase as any)

    const request = new Request('http://localhost:3000/auth/callback?code=test-code')
    const response = await GET(request as any)

    expect(mockCreateClient).toHaveBeenCalled()
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('test-code')
    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/')
  })

  it('should redirect to error page when code exchange fails', async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({
          error: { message: 'Invalid code' },
        }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase as any)

    const request = new Request('http://localhost:3000/auth/callback?code=invalid-code')
    await GET(request as any)

    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/auth?error=auth_failed')
  })

  it('should redirect to error page when no code is provided', async () => {
    const request = new Request('http://localhost:3000/auth/callback')
    await GET(request as any)

    expect(mockCreateClient).not.toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/auth?error=auth_failed')
  })

  it('should redirect to custom next path when provided', async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({
          error: null,
        }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase as any)

    const request = new Request('http://localhost:3000/auth/callback?code=test-code&next=/dashboard')
    await GET(request as any)

    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/dashboard')
  })
})