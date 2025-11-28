// Flow n Mocking
// 1. User logs in Google's redirect URL and
// Google redirects back to my callback URL with an authorization code -> Mock
// 2. route.js checks it and sends page.tsx
import { GET } from '@/app/auth/callback/route'
import { createClient } from '@/app/utils/supabase/server'
import { NextResponse } from 'next/server'

// Mock Supabase client
jest.mock('@/app/utils/supabase/server')
// Mocks NextResponse.redirect to return an object with type and url
jest.mock('next/server', () => ({
  NextResponse: {
    redirect: jest.fn((url: string) => ({ type: 'redirect', url })),
  },
}))

describe('GET() auth callback handler', () => {
  // Let TypeScript know the mocked functions to use mock methods
  const mockRedirect = NextResponse.redirect as jest.MockedFunction<typeof NextResponse.redirect>
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

  // Runs before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Google successfully redirects user to my page
  it('should redirect to home on successful authentication', async () => {
    const mockSupabase = {
      auth: {
        // fn.().mockResolvedValue to mock async functions in async tests
        exchangeCodeForSession: jest.fn().mockResolvedValue({
          error: null,
        }),
      },
    }

    // Create a mock supabase client
    mockCreateClient.mockResolvedValue(mockSupabase as any)

    // Fake request
    const request = new Request('http://localhost:3000/auth/callback?code=test-code')
    // Wait for function to complete
    await GET(request as any)

    // Asserts createClient was called
    expect(mockCreateClient).toHaveBeenCalled()
    // Asserts supabse was called to exchange session with code
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('test-code')
    // Asserts redirect was called with my callback page link
    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/')
  })

  // Test: Google redirect fails with invalid code
  it('should redirect to error page when code exchange fails', async () => {
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({
          error: { message: 'Invalid code' },
        }),
      },
    }

    // Create mock supabase client with invalid code
    mockCreateClient.mockResolvedValue(mockSupabase as any)

    // Fake request with invalid code
    const request = new Request('http://localhost:3000/auth/callback?code=invalid-code')
    await GET(request as any)

    // Asserts redirect was called with my fail page
    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/auth?error=auth_failed')
  })

  // Test: Google redirect fails because of no code
  it('should redirect to error page when no code is provided', async () => {
    // Fack request without code
    const request = new Request('http://localhost:3000/auth/callback')
    await GET(request as any)

    // Asserts client was not called
    expect(mockCreateClient).not.toHaveBeenCalled()
    // Asserts redirect was called with my fail page
    expect(mockRedirect).toHaveBeenCalledWith('http://localhost:3000/auth?error=auth_failed')
  })
})