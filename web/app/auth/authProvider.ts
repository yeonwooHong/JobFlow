'use server'
import { createClient } from '@/app/utils/supabase/server'
import { redirect } from 'next/navigation'
import { logger } from '@/lib/logs/logger';


const signInWith = (provider: any) => async () => {
    // Create Supabase client on server
    const supabase = await createClient()
    // Build callback URL
    const auth_callback_url = `${process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`

    // Initiate OAuth flow
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: auth_callback_url, // Where Google will send user back
        },
    })

//  data, error
// {
//   provider: 'google',
//   url: 'https://rcczpxrmdypytbtkkyij.supabase.co/auth/v1/authorize?provider=google&redirect_to=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fcallback&code_challenge=ALqgad2o8WDs6Cd-Y_adi3tfPJC6KGDomMdcJV5_SGU&code_challenge_method=s256'
// } null

    if (error) {
        logger.error(`[SIGN IN FAIL] Msg:${error.message}`);
        throw new Error(error.message)
    }

    // Redirect to Google's OAuth page
    redirect(data.url) // data.url is Google's authorization URL
}

const signInWithGoogle = signInWith('google')

const signOut = async () => {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        logger.info(`[SIGN OUT] User:${user.id}`);
    }
    
    await supabase.auth.signOut();
}

export { signInWithGoogle, signOut }