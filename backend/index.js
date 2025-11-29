import dotenv from "dotenv";
dotenv.config();

import { fetchJobs } from "./services/jobService.js";

async function main() {
  const data = await fetchJobs("developer jobs in toronto"); // Query depends on user
  console.log("JOB DATA:", data);
}

main();
