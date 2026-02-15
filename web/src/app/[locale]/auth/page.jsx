import AuthForm from '@/components/Forms/AuthForm'
// getTranslations for server components
import { getTranslations } from 'next-intl/server'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const page = async ({ params, searchParams }) => {
 // Extract error message from URL
  const { locale } = await params;
  const { error } = await searchParams;
  const t = await getTranslations('Auth');
  
  return (
    <div className='flex min-h-screen items-center justify-center bg-gray-50 px-4'>
      
      {/* Language Switcher Top Right */}
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      
      <div className='w-full max-w-md space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>
          {t('title')}
          </h1>
          <p className='text-gray-600'>
          {t('subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error === 'auth_failed' && (
          <div className='rounded-lg bg-red-50 border border-red-200 p-4'>
            <p className='text-sm text-red-800'>
              {t('error')}
            </p>
          </div>
        )}

        {/* Auth Form Card */}
        <div className='bg-white rounded-lg shadow border border-gray-200 p-8'>
          <AuthForm locale={locale}/>
        </div>
      </div>
    </div>
  )
}

export default page