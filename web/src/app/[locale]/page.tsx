import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './auth/authProvider'
import { getJobs } from '@/lib/services/jobs'
import { JobTable } from '@/components/JobTable'
import { PaginationControls } from "@/components/PaginationControls"
import { logger } from '@/lib/logs/logger'
import { getTranslations } from 'next-intl/server';

export default async function Home(props: {
    params: Promise<{ locale: string }>;
    searchParams: Promise<{ page?: string }>;
}) {
    const [params, sParams] = await Promise.all([props.params, props.searchParams]);
    const locale = params.locale;
    const currentPage = Number(sParams.page) || 1;

    // Get translations for the Dashboard page
    const t = await getTranslations('Dashboard');

    // Create Supabase client and get the current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // If no user, redirect to auth page - keep the language setting
    if (!user) {
        redirect(`/${locale}/auth`);
    }


    // Page size and current page to pass
    const pageSize = 10

    // Get job data from the service
    const { data: jobs, error, count } = await getJobs(
      supabase,
      currentPage,
      pageSize,
      user.id
    )

    // Calculate total pages if there's count
    const totalPages = count ? Math.ceil(count / pageSize) : 0

   if (error) {
        logger.error(`[JOB FETCH FAIL] User:${user.id} | Msg:${error.message}`);
    } else {
        logger.info(`[JOB FETCH SUCCESS] User:${user.id} | Page:${currentPage} | Count:${count}`);
    }

    return (
        <main className="max-w-6xl mx-auto p-8 font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
                    <p className="text-slate-500 mt-1">{t('description')}</p>
                </div>
                <form>
                    <button formAction={signOut} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
                        {t('signOut')}
                    </button>
                </form>
            </div>

            {/* Job Dashboard */}
            <JobTable jobs={jobs} error={error} />
            {/* Pagination - added margin top 5 for visual separation */}
            <div className="mt-5">
                <PaginationControls currentPage={currentPage} totalPages={totalPages} />
            </div>
        </main>
    )

}