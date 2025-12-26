
// Flow n Mocking
// 1. Create a server side Supabse client -> Mock
// 2. Call supabase.auth.signInWithOAuth -> Mock
// 3. Google's redirect URL -> Mock
import { signInWithGoogle } from '@/app/auth/authProvider'
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'


// Mock Supabase client
jest.mock('@/app/utils/supabase/server') 
// Mock redirect
jest.mock('next/navigation') 

describe('signInWithGoogle', () => {
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect> // Let TypeScript know the mocked functions to use mock methods
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

  // Runs before each test
  beforeEach(() => {
    // Clears call history and return values
    jest.clearAllMocks()
    process.env.SITE_URL = 'http://localhost:3000'
  })

  // Test: Google OAuth login success
  it('should redirect to Google OAuth URL on success', async () => {
    const mockSupabase = {
      auth: {
        // fn.().mockResolvedValue to mock async functions in async tests
        signInWithOAuth: jest.fn().mockResolvedValue({ 
          data: { url: 'https://accounts.google.com/oauth' },
          error: null,
        }),
      },
    }

    // mockCreateClient() returns the mock Supabase client
    // as any bypasses TypeScript checks
    mockCreateClient.mockResolvedValue(mockSupabase as any)

    // Wait for function to complete
    await signInWithGoogle()
    // Asserts createClient was called
    expect(mockCreateClient).toHaveBeenCalled()
    // Asserts signInWithOAuth was called with the expected arguments
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    // Asserts redirect was called with the Google OAuth URL
    expect(mockRedirect).toHaveBeenCalledWith('https://accounts.google.com/oauth')
  })

  // Test: Google OAuth login fail
  it('should throw error when OAuth fails', async () => {
    const mockSupabase = {
      auth: {
        signInWithOAuth: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'OAuth failed' },
        }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase as any)

    // Asserts the function rejects and throws an error with the expected message
    await expect(signInWithGoogle()).rejects.toThrow('OAuth failed')
    // Asserts redirect was not called on error
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})