import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config(); // .env file load

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URLL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export default supabase;