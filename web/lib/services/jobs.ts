import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logs/logger';

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

  logger.debug(`[DB FETCH START] User:${userId} | Range:${from}-${to}`);

  // Fetch data and total count using { count: 'exact' }
  const result = await supabase
  .from('v_user_job_list') // call the view instead of the table
  .select('*', { count: 'exact' })
  .eq('keyword_user_id', userId)
  .range(from, to);

  if (result.error) {
    logger.error(`[DB FETCH FAIL] User:${userId} | Msg:${result.error.message}`);
  }

  return result
}