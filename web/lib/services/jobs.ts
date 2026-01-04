import { SupabaseClient } from '@supabase/supabase-js'

// Fetches a paginated list of jobs from Supabase
export async function getJobs(
  supabase: SupabaseClient, 
  page: number, 
  pageSize: number = 10,
  userId: string
) {
  // Calculate the data range to retrieve
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Fetch data and total count using { count: 'exact' }
  return await supabase
  .from('v_user_job_list') // call the view instead of the table
  .select('*', { count: 'exact' })
  .eq('keyword_user_id', userId)
  .range(from, to);
}

// Updates the application status of a job for a specific user
export async function updateJobStatus(
  supabase: SupabaseClient,
  jobId: string,
  status: string,
  userId: string) {
  const { error } = await supabase
    .from('user_jobs')
    .upsert({ 
      job_id: jobId, 
      user_id: userId, 
      status: status,
      updated_at: new Date().toISOString()
    }, { onConflict: 'job_id, user_id' }); // Only one status per user per job

  return { error };
}