import { createClient } from './utils/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from './auth/authProvider'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis
} from "@/components/ui/pagination"

// Status badges's color styles
const getStatusStyle = (status: string) => {
  const s = status?.toLowerCase() || '';
  if (s.includes('not applied')) return 'bg-gray-100 text-gray-700 border-gray-200';
  if (s.includes('applied')) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (s.includes('interview')) return 'bg-purple-100 text-purple-700 border-purple-200';
  if (s.includes('offer')) return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('rejected')) return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('accepted')) return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

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
  
  // Calculate the 5-page pagination window
  const maxVisible = 5
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  let endPage = Math.min(totalPages, startPage + maxVisible - 1)
  
  // Adjust if we are near the end page
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1)
  }

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
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-100">
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Title</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Company</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Posted Date</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {error ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-red-500">Failed to load jobs.</td></tr>
            ) : jobs && jobs.length > 0 ? (
              jobs.map((job: any) => {
                const dateStr = job.posted_at || job.created_at;
                const displayDate = dateStr ? dateStr.split('T')[0] : 'N/A';

                return (
                  <tr key={job.id} className="hover:bg-slate-100 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{job.title}</td>
                    <td className="px-6 py-4 text-slate-600">{job.employer_name}</td>
                    <td className="px-6 py-4 text-slate-600">{displayDate}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(job.status)}`}>
                        {job.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">No job applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

       {/* Pagination */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">

          <Pagination className="justify-center">
            <PaginationContent>

            {/* Previous button */}
              <PaginationItem>
                <PaginationPrevious 
                  href={`/?page=${currentPage - 1}`}
                  // Disable if on first page
                  className={currentPage <= 1 ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>

              {/* Jump to first page */}
              {startPage > 1 && (
                <>
                  <PaginationItem><PaginationLink href="/?page=1">1</PaginationLink></PaginationItem>
                  <PaginationItem><PaginationEllipsis /></PaginationItem>
                </>
              )}

              {/* Page Numbers*/}
              {Array.from({ length: (endPage - startPage) + 1 }, (_, i) => startPage + i).map((page) => (
                <PaginationItem key={page}>
                {/* Highlight current page number */}
                  <PaginationLink href={`/?page=${page}`} isActive={currentPage === page}>
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Jump to last page */}
              {endPage < totalPages && (
                <>
                  <PaginationItem><PaginationEllipsis /></PaginationItem>
                  <PaginationItem><PaginationLink href={`/?page=${totalPages}`}>{totalPages}</PaginationLink></PaginationItem>
                </>
              )}

            {/* Next button */}  
              <PaginationItem>
                <PaginationNext 
                  href={`/?page=${currentPage + 1}`}
                  // Disable if on last page
                  className={currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
      
      </div>
    </main>
  )

}