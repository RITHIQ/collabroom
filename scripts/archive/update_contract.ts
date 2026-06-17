import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BRAND_EMAIL = 'collabroomoperations+brand@gmail.com';
const PASSWORD = 'Project2027#';

async function updateContract() {
  console.log('Logging in as brand...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: BRAND_EMAIL,
    password: PASSWORD,
  });
  
  if (authErr) {
    console.error('Login failed:', authErr.message);
    process.exit(1);
  }
  
  const brandUserId = authData.user.id;
  console.log('Logged in. Brand user ID:', brandUserId);
  
  // First, find the brand_id associated with this user
  const { data: brandData, error: brandErr } = await supabase
    .from('brands')
    .select('id')
    .eq('user_id', brandUserId)
    .maybeSingle();
    
  if (brandErr || !brandData) {
    console.error('Could not find brand profile for user.', brandErr);
    process.exit(1);
  }
  
  const brandId = brandData.id;
  console.log('Found brand ID:', brandId);
  
  // Find all contracts
  const { data: contracts, error: contractErr } = await supabase
    .from('contracts')
    .select('*');
    
  if (contractErr) {
    console.error('Error fetching contracts:', contractErr);
    process.exit(1);
  }
  
  if (!contracts || contracts.length === 0) {
    console.log('No contracts found to update. Please run seed script first.');
    process.exit(0);
  }
  
  console.log(`Found ${contracts.length} contracts. Updating...`);
  
  // Update all contracts to be Zomato x Rithik
  for (const contract of contracts) {
    const richContent = {
      parties: 'Zomato Ltd. (Client) and Rithik (Creator)',
      compensation: '₹2,85,000 secured via ColabRoom Escrow.',
      scope: 'A three-part Instagram Reel series highlighting local hidden gems across three tier-2 cities. Content must integrate Zomato Gold perks seamlessly.', 
      liability: 'Creator agrees to adhere to the brand safety guidelines (no political, religious, or controversial statements in the content).',
      kill_fee: 'A 25% kill fee is applicable if the campaign is paused post-travel bookings.',
      amount: 285000
    };
    
    const { error: updateErr } = await supabase
      .from('contracts')
      .update({
        brand_name: 'Zomato',
        creator_name: 'Rithik',
        total_amount: 285000,
        content: richContent,
        status: 'sent', // Set to 'sent' so the creator can sign it
      })
      .eq('id', contract.id);
      
    if (updateErr) {
      console.error(`Failed to update contract ${contract.id}:`, updateErr);
    } else {
      console.log(`Successfully updated contract ${contract.id} to Zomato × Rithik!`);
    }
  }
  
  console.log('Finished updating database!');
}

updateContract().catch(console.error);
