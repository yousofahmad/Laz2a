import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xyoqadaeqmdmwnhtzcfn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_eCkK84X5vbb5fTIfh9C04A_gPT2m3fP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
