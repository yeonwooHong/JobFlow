import dotenv from "dotenv";
dotenv.config();

import { fetchJobs } from "./services/jobService.js";

async function main() {
  const data = await fetchJobs("developer jobs in toronto"); // Query depends on user input
  console.log("Job fetching process completed.");
}

main();
