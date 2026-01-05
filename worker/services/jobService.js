import axios from "axios";
import dotenv from "dotenv";
import supabase from "../supabaseClient.js";
import logger from '../lib/logger.js';

dotenv.config();

// Request Job data from the OpenAPI(JSearch)
export async function fetchJobs(query) {
    logger.info(`[JOB FETCH START] Query: "${query}" - Requesting up to 5 pages`);
    for (let page = 1; page <= 5; page++) {
        try {
            logger.info(`[PAGE ${page}] Requesting jobs from API...`);
            
            const response = await axios.get(process.env.RAPIDAPI_URL, {
                params: {
                    query, // Refactor: User's initial setting
                    page: page.toString(), // 1 page 10 items
                    num_pages: "1", // 1 - 50
                    country: "ca",
                    date_posted: "all", // all, today, 3days, week, month
                },
                headers: {
                    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                    "x-rapidapi-host": process.env.RAPIDAPI_HOST,
                },
                timeout: 15000, // Up to request page 2, OpenAPI response time gets very slow
            });

            const jobs = response.data?.data ?? [];

            if (jobs.length === 0) {
                logger.warn(`[PAGE ${page}] No more jobs, stop fetching.`);
                break;
            }

            logger.info(`[PAGE ${page}] Successfully fetched ${jobs.length} jobs.`);

            await saveJobsToSupabase(response.data);

            // Stop early if the job is older then MAX_JOB_AGE_DAYS
            const MAX_JOB_AGE_DAYS = 7
            const cutoffDate = new Date(Date.now() - MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000);
            const hasOldJobs = jobs.some(
                job => new Date(job.job_posted_at_datetime_utc) < cutoffDate
            );

            if (hasOldJobs) {
                logger.info(`[JOB FETCH STOP] Old jobs (over 7 days) detected on page ${page}. Stop fetching.`);
                break;
            }
        } catch (error) {
            if (error.code === "ECONNABORTED") {
                logger.warn(`[JOB FETCH TIMEOUT] Request timed out on page ${page}. Skipping remaining pages.`);
                break;
            }
            logger.error(`[JOB FETCH FAIL] Page ${page} failed:`, error.message);
            throw err;
        }
    }
    logger.info(`[JOB FETCH SUCCESS] Completed for query: "${query}"`);
}

// Save data to DB
export async function saveJobsToSupabase(jobs) {
    try {
        // Map data fields
        const jobsArray = jobs.data.map(job => ({
            job_id: job.job_id,
            title: job.job_title,
            description: job.job_description,
            link: job.job_apply_link,
            employment_type: job.job_employment_type,
            employer_name: job.employer_name,
            country_code:job.job_country,
            city: job.job_city,
            state: job.job_state,
            location: job.job_location,
            latitude: job.job_latitude,
            longitude: job.job_longitude,
            is_remote: job.job_is_remote,
            posted_at: job.job_posted_at_datetime_utc,
            keyword_id: 1 // Refactor: link to user's keyword setting
        }))

        logger.debug(`Trying to upsert ${jobsArray.length} jobs to Supabase.`);

        // Upsert data into DB
        // Check the duplicated rows: job_id (unique)
        const { data, error } = await supabase
            .from('jobs')
            .upsert(jobsArray, {
                onConflict: "job_id",
                ignoreDuplicates: false,
            }).select();
        
        // Supabase doesn't stop execution on error, so I need to manually check
        if (error) throw error;

        if (data && data.length > 0) {
            logger.info(`[JOB SAVE SUCCESS] Successfully inserted ${data.length} jobs into Supabase.`);
        } else {
            logger.info("[JOB SAVE SUCCESS] No new jobs inserted (all duplicates).");
        }

    } catch (error) {
        logger.error("[JOB SAVE FAIL] Failed to save jobs to Supabase:", error.message);
    }
}