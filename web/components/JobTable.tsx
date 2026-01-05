'use client';

import { useState } from 'react';
import { createClient } from '@/app/utils/supabase/client';
import { JOB_STATUS } from '@/lib/constants';
import { updateJobStatus } from '@/lib/services/jobs.server';
import { useRouter } from 'next/navigation';

// Define Job object
interface Job {
  id: string;
  title: string;
  employer_name: string;
  posted_at: string;
  created_at: string;
  recent_date: string; // most recent application date between posted_at and created_at
  application_status: string;
}

// Define what data the JobTable component expects
interface JobTableProps {
  jobs: Job[] | null;
  error: any;
}

export const getStatusStyle = (status: string) => {
  // Status badges's color styles
  const styles: Record<string, string> = {
    [JOB_STATUS.NOT_APPLIED]:  'bg-gray-100 text-gray-700 border-gray-200',
    [JOB_STATUS.APPLIED]:      'bg-orange-100 text-orange-700 border-orange-200',
    [JOB_STATUS.INTERVIEWING]: 'bg-purple-100 text-purple-700 border-purple-200',
    [JOB_STATUS.OFFERED]:      'bg-green-100 text-green-700 border-green-200',
    [JOB_STATUS.REJECTED]:     'bg-red-100 text-red-700 border-red-200',
    [JOB_STATUS.ACCEPTED]:     'bg-blue-100 text-blue-700 border-blue-200',
  };

  // Default: Not Applied
  return styles[status] || styles[JOB_STATUS.NOT_APPLIED];
};

export function JobTable({ jobs, error }: JobTableProps) {
  const supabase = createClient();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState<string | null>(null); // To block multiple updates

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert('Please log in to update job status.');

    setIsUpdating(jobId); // Set updating state

    const { error } = await updateJobStatus(jobId, newStatus, user.id);

    if (error) {
      alert('Failed to update job status.');
    } else {
      // Refresh the server component data to reflect the View update
      router.refresh();
    }
    setIsUpdating(null);
  };

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
              const currentStatus = job.application_status || JOB_STATUS.NOT_APPLIED;

              return (
                <tr key={job.id} className="hover:bg-slate-100 transition-colors">

                {/* Job title */}
                  <td
                    className="px-6 py-4 font-semibold text-slate-900 truncate"
                    title={job.title} // Added truncation and tooltip to show full title on hover
                  >
                    {job.title}</td>
                
                {/* Employer name */}
                  <td className="px-6 py-4 text-slate-600">{job.employer_name}</td>
                
                {/* Posted Date */}
                  <td className="px-6 py-4 text-slate-600">{job.recent_date ? job.recent_date.split('T')[0] : 'N/A'}</td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <div className="relative group">
                      <select
                        value={currentStatus}
                        disabled={isUpdating === job.id}
                        onChange={(e) => handleStatusChange(job.id, e.target.value)}
                        className={`
                          appearance-none cursor-pointer px-2 py-1 rounded-full text-xs text-center font-medium border transition-all
                          focus:outline-none focus:ring-2 focus:ring-slate-400
                          ${getStatusStyle(currentStatus)}
                          // Dim the opacity when updating
                          ${isUpdating === job.id ? 'opacity-20' : 'opacity-100'} 
                        `}
                      >
                        {/* Status dropdown options */}
                        {Object.values(JOB_STATUS).map((status) => (
                          <option key={status} value={status} className="bg-white text-slate-900">
                            {status}
                          </option>
                        ))}
                      </select>
    
                    </div>
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