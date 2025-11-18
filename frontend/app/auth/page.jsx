import AuthForm from '@/components/Forms/AuthForm'
import React from 'react'

const page = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black'>
        <h1 className='text-2xl font-bold'>Not Authenticated</h1>
      <AuthForm />
    </div>
  )
}

export default page