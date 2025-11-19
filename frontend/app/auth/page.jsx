import AuthForm from '@/components/Forms/AuthForm'

const page = ({ searchParams }) => {
  const error = searchParams?.error // Extract error message from URL
  
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      <div className='w-full max-w-md space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>
            Welcome to JobFlow
          </h1>
          <p className='text-gray-600'>
            Sign in to track your job applications
          </p>
        </div>

        {/* Error Message */}
        {error === 'auth_failed' && (
          <div className='rounded-lg bg-red-50 border border-red-200 p-4'>
            <p className='text-sm text-red-800'>
              Authentication failed. Please try again.
            </p>
          </div>
        )}

        {/* Auth Form Card */}
        <div className='bg-white rounded-lg shadow border border-gray-200 p-8'>
          <AuthForm />
        </div>
      </div>
    </div>
  )
}

export default page