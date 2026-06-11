import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function check() {
  const { data, error } = await supabase.from('contracts').select('*').limit(1);
  console.log(error);
  console.log(data);
}
check();
