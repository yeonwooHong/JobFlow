'use server'

import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'

const signInWith = provider => async () => {
    const supabase = await createClient()
    const auth_callback_url = `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url,
        },
    })

    console.log(data, error)

    if (error) {
        throw new Error(error.message)
    }

    redirect(data.url)
}

const signInWithGoogle = signInWith('google')

export { signInWithGoogle }