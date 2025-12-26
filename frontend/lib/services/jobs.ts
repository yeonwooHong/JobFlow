import { SupabaseClient } from '@supabase/supabase-js'

//Fetches a paginated list of jobs from Supabase
export async function getJobs(
  supabase: SupabaseClient, 
  page: number, 
  pageSize: number = 10
) {
  // Calculate the data range to retrieve
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // Fetch data and total count using { count: 'exact' }
  return await supabase
    .from('jobs')
    .select(
      'id, title, employer_name, posted_at, created_at, status', 
      { count: 'exact' }
    )
    .order('posted_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, to)
}