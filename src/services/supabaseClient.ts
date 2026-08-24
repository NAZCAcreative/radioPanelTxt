import { createClient } from '@supabase/supabase-js';

// This is Supabase's "publishable" key - it is designed to be embedded in
// client-side code (same trust model as a Firebase web config or a Stripe
// publishable key). Access control lives entirely in the database's Row
// Level Security policies (see supabase/schema.sql), not in keeping this
// value secret. Never put the project's secret/service-role key here.
const SUPABASE_URL = 'https://asuqocsqwmxohjdxgknv.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_RycIak2ik2Y25lO1_ERaoA_maFuJj4v';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
