import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './auth/authProvider'
import { JobTable } from '@/components/JobTable'
import { PaginationControls } from "@/components/PaginationControls"

// Status badges's color styles

export default async function Home({ searchParams }: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  // Parallelize Auth check and SearchParams resolution
  const [userData, params] = await Promise.all([
    supabase.auth.getUser(),
    searchParams
  ])

  if (!userData.data.user) redirect('/auth')

  // Pagination logic
  const pageSize = 10
  const currentPage = Number(params.page) || 1 // related 1.

  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  // Fetch data and total count using { count: 'exact' }
  const { data: jobs, error, count } = await supabase
    .from('jobs')
    .select(
    'id, title, employer_name, posted_at, created_at, status',
    { count: 'exact' }
    )
    .order('posted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  // Calculate total pages if there's count
  const totalPages = count ? Math.ceil(count / pageSize) : 0
  
  if (error) {
    console.error('Error fetching jobs:', error)
  }
  console.log('Number of fetched jobs:', jobs?.length)

  return (
    <main className="max-w-6xl mx-auto p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Job Applications</h1>
          <p className="text-slate-500 mt-1">Track and manage your job search journey ✨</p>
        </div>
        <form>
          <button formAction={signOut} className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">
            Sign Out
          </button>
        </form>
      </div>

      {/* Job Dashboard */}
      <JobTable jobs={jobs} error={error} />
           
      {/* Pagination */}
      <PaginationControls currentPage={currentPage} totalPages={totalPages} />

    </main>
  )

}