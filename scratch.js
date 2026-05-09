import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('scheduled_sessions')
    .select('*, tests(title, reward_amount, meeting_link, estimated_duration), study_slots(start_time, end_time)')
    .limit(1);
  console.log("Error:", error);
}
run();
