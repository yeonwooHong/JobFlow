import axios from "axios";
import dotenv from "dotenv";
import supabase from "../supabaseClient.js";

dotenv.config();

// Request Job data from the OpenAPI(JSearch)
export async function fetchJobs(query) {
    for (let page = 1; page <= 5; page++) {
        try {
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
                console.log("No more jobs, stop requesting.");
                break;
            }

            await saveJobsToSupabase(response.data);

            // Stop early if the job is older then MAX_JOB_AGE_DAYS
            const MAX_JOB_AGE_DAYS = 7
            const cutoffDate = new Date(Date.now() - MAX_JOB_AGE_DAYS * 24 * 60 * 60 * 1000);

            const hasOldJobs = jobs.some(
                job => new Date(job.job_posted_at_datetime_utc) < cutoffDate
            );

            if (hasOldJobs) {
                console.log(`Old jobs detected, stopping pagination on page ${page}.`);
                break;
            }
        } catch (err) {
            if (err.code === "ECONNABORTED") {
                console.warn(
                  `Request timed out on page ${page}. Stopping pagination.`
                );
                break;
            }
            console.error("Fail to fetch job data:", err.message);
            throw err;
        }
    }
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
        }))

        // Insert data into DB
        // Check the duplicated rows: job_id (unique)
        const { data, error } = await supabase
            .from('jobs')
            .upsert(jobsArray, {
                onConflict: "job_id",
                ignoreDuplicates: true,
            });

        if (error) {
            console.error("Error occurs while inserting data into Supabase:", error);
            throw error;
        }

        if (data && data.length > 0) {
            console.log(`Successfully inserted ${data.length} jobs into Supabase.`);
        } else {
            console.log("No new jobs inserted (all duplicates).");
        }

    } catch (err) {
        console.error("Fail to save job data:", err.message);
        throw err;
    }
}