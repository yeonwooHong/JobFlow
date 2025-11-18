'use client'
import React from 'react'
import { signInWithGoogle } from '@/app/utils/actions'

const AuthForm = () => {
    return (
        <div>
            <form>
                <button type='submit' className='btn' formAction={signInWithGoogle}>
                    Sign in with Google
                    </button>
            </form>
        </div>
    )
}

export default AuthForm