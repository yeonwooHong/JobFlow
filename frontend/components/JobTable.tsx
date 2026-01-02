// Define Job object
interface Job {
  id: string;
  title: string;
  employer_name: string;
  posted_at: string;
  created_at: string;
  status: string;
}

// Define what data the JobTable component expects
interface JobTableProps {
  jobs: Job[] | null;
  error: any;
}

const getStatusStyle = (status: string) => {
  // Status badges's color styles
  const s = status?.toLowerCase() || '';
  if (s.includes('not applied')) return 'bg-gray-100 text-gray-700 border-gray-200'
  if (s.includes('applied')) return 'bg-orange-100 text-orange-700 border-orange-200';
  if (s.includes('interviewing')) return 'bg-purple-100 text-purple-700 border-purple-200';
  if (s.includes('offered')) return 'bg-green-100 text-green-700 border-green-200';
  if (s.includes('rejected')) return 'bg-red-100 text-red-700 border-red-200';
  if (s.includes('accepted')) return 'bg-blue-100 text-blue-700 border-blue-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

export function JobTable({ jobs, error }: JobTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      {/* Fixed table layout to not to break the widths */}
      <table className="w-full text-left border-collapse table-fixed">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-100">
            {/* Title column takes bigger proportion */}
            <th className="w-[45%] px-6 py-4 text-sm font-semibold text-slate-600">Title</th>
            <th className="w-[25%] px-6 py-4 text-sm font-semibold text-slate-600">Company</th>
            <th className="w-[15%] px-6 py-4 text-sm font-semibold text-slate-600">Posted Date</th>
            <th className="w-[15%] px-6 py-4 text-sm font-semibold text-slate-600">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {error ? (
            <tr><td colSpan={4} className="px-6 py-8 text-center text-red-500">Failed to load jobs.</td></tr>
          ) : jobs && jobs.length > 0 ? (
            jobs.map((job) => {
              const dateStr = job.posted_at || job.created_at;
              const displayDate = dateStr ? dateStr.split('T')[0] : 'N/A';

              return (
                <tr key={job.id} className="hover:bg-slate-100 transition-colors">
                  {/* Added truncation and tooltip for long titles */}
                  <td
                    className="px-6 py-4 font-semibold text-slate-900 truncate"
                    title={job.title} // Tooltip to show full title on hover
                  >
                    {job.title}</td>
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
  );
}