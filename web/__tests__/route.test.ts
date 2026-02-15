// Flow n Mocking
// 1. User logs in Google's redirect URL and
// Google redirects back to my callback URL with an authorization code -> Mock
// 2. route.js checks it and sends page.tsx
import { GET } from '@/app/[locale]/auth/callback/route'
import { createClient } from '@/app/[locale]/utils/supabase/server'
import { NextResponse } from 'next/server'

// To remove logger errors during tests
jest.mock('@/lib/logs/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

// Mock Supabase client
jest.mock('@/app/[locale]/utils/supabase/server') 
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

  // Language setting
  const testLocale = 'fr'; 
  // Create fake request and params
  const createMockRequest = (urlPath: string) => {
    const request = new Request(`http://localhost:3000${urlPath}`);
    const params = { params: Promise.resolve({ locale: testLocale }) };
    return { request, params };
  };

  // Runs before each test
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Test: Google successfully redirects user to my page
  it('should redirect to home on successful authentication', async () => {
    const { request, params } = createMockRequest(`/${testLocale}/auth/callback?code=test-code`);

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

    // Wait for function to complete
    await GET(request as any, params)

    // Asserts createClient was called
    expect(mockCreateClient).toHaveBeenCalled()
    // Asserts supabse was called to exchange session with code
    expect(mockSupabase.auth.exchangeCodeForSession).toHaveBeenCalledWith('test-code')
    // Asserts redirect was called with my callback page link
    const expectedUrl = `http://localhost:3000/${testLocale}/`;
    // The route handler passes a URL object, so verify the 'href' property using expect.objectContaining
    expect(mockRedirect).toHaveBeenCalledWith(expect.objectContaining({href:expectedUrl})); 
  })

  // Test: Google redirect fails with invalid code
  it('should redirect to error page when code exchange fails', async () => {
    // Fake request with invalid code
    const { request, params } = createMockRequest(`/${testLocale}/auth/callback?code=invalid-code`);

    const mockSupabase = {
      auth: {
        exchangeCodeForSession: jest.fn().mockResolvedValue({
          error: { message: 'Invalid code' },
        }),
      },
    }

    // Create mock supabase client with invalid code
    mockCreateClient.mockResolvedValue(mockSupabase as any)

    await GET(request as any, params)

    // Asserts redirect was called with my fail page
    const expectedUrl = `http://localhost:3000/${testLocale}/auth?error=auth_failed`;
    // The route handler passes a URL object, so use expect.stringContaining
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining(expectedUrl));
  })

  // Test: Google redirect fails because of no code
  it('should redirect to error page when no code is provided', async () => {
    // Fack request without return code
    const { request, params } = createMockRequest(`/${testLocale}/auth/callback`);
    await GET(request as any, params)

    // Asserts client was not called
    expect(mockCreateClient).not.toHaveBeenCalled()
    // Asserts redirect was called with my fail page
    const expectedUrl = `http://localhost:3000/${testLocale}/auth?error=auth_failed`;
    expect(mockRedirect).toHaveBeenCalledWith(expect.stringContaining(expectedUrl));
  })
})