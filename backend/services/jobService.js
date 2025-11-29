import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function fetchJobs(query) {
  try {
    const response = await axios.get(process.env.RAPIDAPI_URL, {
      params: {
        query, // Refactor: User's initial setting
        page: "1", // 1 page 10 items
        num_pages: "1", // 1 - 50
        country: "us",
        date_posted: "all", // all, today, 3days, week, month
      },
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    });

    return response.data;
  } catch (err) {
    console.error("API error:", err.message);
    throw err;
  }
}
