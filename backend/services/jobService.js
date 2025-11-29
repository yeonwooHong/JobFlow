import axios from "axios";
import dotenv from "dotenv";
import supabase from "../supabaseClient.js";

dotenv.config();

// Request Job data from the OpenAPI
export async function fetchJobs(query) {
    try {
        const response = await axios.get(process.env.RAPIDAPI_URL, {
            params: {
                query, // Refactor: User's initial setting
                page: "1", // 1 page 10 items
                num_pages: "1", // 1 - 50
                country: "ca",
                date_posted: "all", // all, today, 3days, week, month
            },
            headers: {
                "x-rapidapi-key": process.env.RAPIDAPI_KEY,
                "x-rapidapi-host": process.env.RAPIDAPI_HOST,
            },
        });

        // return response.data;
        await saveJobsToSupabase(response.data);
    } catch (err) {
        console.error("Fail to fetch job data:", err.message);
        throw err;
    }
}

// Save data to DB
export async function saveJobsToSupabase(jobs) {
    try {
        // Map data fields
        const jobsArray = jobs.data.map(job => ({
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
        // Refactor: Should check the duplicated rows: job_id
        const { data, error } = await supabase
            .from('jobs')
            .insert(jobsArray)
            .select();

        if (error) {
            console.error("Error occurs while inserting data into Supabase:", error);
            throw error;
        }
        
        console.log(`Successfully inserted ${data.length} jobs into Supabase.`);
    } catch (err) {
        console.error("Fail to save job data:", err.message);
        throw err;
    }
}