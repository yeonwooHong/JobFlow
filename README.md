
## 👉 Overview

This project is a job-tracking web application built using:

- **Next.js (Web Application)**: Handles the full-stack user experience, including dashboard, auth, and data display. Supports multi-language (i18n) for global accessibility.

- **Supabase (Backend + Database + Auth)**: Provides PostgreSQL database, secure authentication, and Row Level Security (RLS).

- **Node.js (Worker)**: A background engine for periodic data collection and future AI processing.

The MVP focuses on collecting job postings via external APIs, displaying them on a dashboard, and allowing users to track their application status.

Later, the project will expand with AI (integrated into the Worker) to summarize job descriptions.


## 👉 Tech Stack

### Web Service (web)
- Next.js (App Router)
- Tailwind CSS
- next-intl (Internationalization)

### Data Engine (worker)
- Node.js
- External API Integration (RapidAPI - JSearch)
- node-cron (Scheduled Tasks)

### Backend / Database
- Supabase (Auth & PostgreSQL)

## 👉 Features (MVP)

### User Authentication

* Google login via Supabase Auth
* Secure data access through Row Level Security (RLS)

### Multi-language Support (i18n)
* English & French support: Fully localized UI including dashboards, forms, and status tags.
* Dynamic Routing: URL-based language switching (e.g., `/en/dashboard`, `/fr/dashboard`).
* Automatic Detection: Middleware-based language detection and redirection.

### Job Postings

* Fetch job data via an external API (RapidAPI - JSearch)
* Save job postings into the Supabase jobs table
* Use a SQL View (v_user_job_list) to join job data with user-specific application statuses.
* Sorted by recent_date (prioritizing posted_at over created_at).

### Job Details

* View individual job postings
* Show title, company, location, link, posted date, and status

### Status Tracking

* Update status tags for specific jobs::
  * Not applied
  * Applied
  * Interviewing
  * Rejected
  * Offered
  * Accepted

### Sorting & Filtering

* Filter by status
* Advanced sorting by the most recent and relevant posting dates.

