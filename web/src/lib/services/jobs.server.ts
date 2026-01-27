'use server'
import { createClient } from '@/app/[locale]/utils/supabase/server';
import { logger } from '@/lib/logs/logger';

// Updates the application status of a job for a specific user
export async function updateJobStatus(
  jobId: string,
  status: string,
  userId: string) {
    const supabase = await createClient();
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