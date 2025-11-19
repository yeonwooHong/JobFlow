'use server'

import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'

const signInWith = provider => async () => {
    // 1. Create Supabase client on server
    const supabase = await createClient()
    // 2. Build callback URL
    const auth_callback_url = `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    
    // 3. Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url, // Where Google will send user back
        },
    })

    console.log(data, error)

    if (error) {
        throw new Error(error.message)
    }

    // 4. Redirect to Google's OAuth page
    redirect(data.url) // data.url is Google's authorization URL
}

const signInWithGoogle = signInWith('google')

const signOut = async () => {
    const supabase = await createClient()
    await supabase.auth.signOut()
}

export { signInWithGoogle, signOut }