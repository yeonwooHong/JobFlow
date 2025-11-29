import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // .env file load

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // To bypass Row Level Security
);

export default supabase;