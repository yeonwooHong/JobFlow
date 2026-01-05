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

// Updates the application status of a job for a specific user
export async function updateJobStatus(
  supabase: SupabaseClient,
  jobId: string,
  status: string,
  userId: string) {
    logger.info(`[STATUS UPDATE TRY] User:${userId} | Job:${jobId} | To:${status}`);

  const { error } = await supabase
    .from('user_jobs')
    .upsert({ 
      job_id: jobId, 
      user_id: userId, 
      status: status,
      updated_at: new Date().toISOString()
    }, { onConflict: 'job_id, user_id' }); // Only one status per user per job

    if (error) {
    logger.error(`[STATUS UPDATE FAIL] User:${userId} | Job:${jobId} | Msg:${error.message}`);
  } else {
    logger.info(`[STATUS UPDATE SUCCESS] User:${userId} | Job:${jobId} | To:${status}`);
  }

  return { error };
}