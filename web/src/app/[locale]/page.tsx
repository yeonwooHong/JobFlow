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
    // 1. 모든 비동기 파라미터를 먼저 해결합니다. (React 19 필수)
    const [params, sParams] = await Promise.all([props.params, props.searchParams]);
    const locale = params.locale;
    const currentPage = Number(sParams.page) || 1;

    // 2. 번역 훅을 호출합니다.
    const t = await getTranslations('Dashboard');

    // 3. Supabase 클라이언트 생성 및 인증 확인
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 사용자가 없으면 해당 언어의 auth 페이지로 이동
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