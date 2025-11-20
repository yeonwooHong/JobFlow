
// Flow n Mocking
// 1. Create a server side Supabse client -> Mock
// 2. Call supabase.auth.signInWithOAuth -> Mock
// 3. Google's redirect URL -> Mock
import { signInWithGoogle } from '@/app/utils/actions'
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'


jest.mock('@/app/utils/supabase/server') // To mock Supabase client
jest.mock('next/navigation') // To mock redirect

describe('signInWithGoogle', () => {
  const mockRedirect = redirect as jest.MockedFunction<typeof redirect>
  const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SITE_URL = 'http://localhost:3000'
  })

  it('should redirect to Google OAuth URL on success', async () => {
    const mockSupabase = {
      auth: {
        signInWithOAuth: jest.fn().mockResolvedValue({
          data: { url: 'https://accounts.google.com/oauth' },
          error: null,
        }),
      },
    }

    mockCreateClient.mockResolvedValue(mockSupabase as any)

    await signInWithGoogle()
    expect(mockCreateClient).toHaveBeenCalled()
    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    })
    expect(mockRedirect).toHaveBeenCalledWith('https://accounts.google.com/oauth')
  })

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

    await expect(signInWithGoogle()).rejects.toThrow('OAuth failed')
    expect(mockRedirect).not.toHaveBeenCalled()
  })
})