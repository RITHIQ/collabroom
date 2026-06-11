import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'collabroomoperations+brand@gmail.com',
    password: 'Project2027#'
  });
  if (authErr) throw authErr;
  console.log('Logged in as', authData.user?.id);

  const payload = {
    title: 'Test',
    description: 'Test desc',
    type: 'sponsored_post',
    budget: 10000,
    currency: 'INR',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    slots_total: 5,
    slots_filled: 0,
    platforms: ['instagram'],
    content_formats: ['reel'],
    niche: 'Fitness',
    deliverables: ['1 Reel'],
    brand_name: 'Test Brand',
    brand_user_id: authData.user?.id,
    status: 'active',
    visibility: 'public'
  };

  const { data, error } = await supabase.from('campaigns').insert(payload).select();
  console.log('Insert Result:', data);
  console.log('Insert Error:', error);
}

test().catch(console.error);
