
## 👉 Overview

This project is a job-tracking web application built using:

* **Next.js (Frontend)**
* **Supabase (Backend + Database + Auth)**
* **Node.js (Backend)**

The MVP focuses on collecting job postings via external APIs, displaying them on a dashboard, and allowing users to track their application status.  
Later, the project will expand with AI to summarize job descriptions.


## 👉 Tech Stack

### Frontend

* Next.js
* Tailwind CSS

### Backend / Database

* Node.js
* Supabase

## 👉 Features (MVP)

### User Authentication

* Google login via Supabase Auth

### Job Postings

* Fetch job data via an external API (RapidAPI - JSearch)
* Save job postings into the Supabase jobs table
* Display jobs in a table

### Job Details

* View individual job postings
* Show title, company, location, link, posted date, and status

### Status Tracking

* Update status tags:
  * Not applied
  * Applied
  * Interviewing
  * Rejected
  * Offered

### Sorting & Filtering

* Filter by status
* Sort by posted date

