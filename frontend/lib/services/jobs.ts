import { SupabaseClient } from '@supabase/supabase-js'

//Fetches a paginated list of jobs from Supabase
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