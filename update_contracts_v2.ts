import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xcorhotvnayrboihsdvm.supabase.co';
const SUPABASE_KEY = 'sb_publishable_umiqwHBQxpE2ATCtfYiEMQ_NAl2nNRi';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BRAND_EMAIL = 'collabroomoperations+brand@gmail.com';
const PASSWORD = 'Project2027#';

const CONTRACT_TEMPLATES = [
  {
    brand_name: 'Zomato',
    creator_name: 'Rithik',
    total_amount: 285000,
    content: {
      title: 'Zomato City Trails Campaign',
      amount: 285000,
      clauses: [
        { section: '1. Parties', content: 'This Agreement is between Zomato Ltd. ("Brand") and Rithik ("Creator") via the ColabRoom Platform.' },
        { section: '2. Scope of Work', content: 'Creator agrees to produce a three-part Instagram Reel series highlighting local hidden culinary gems across three tier-2 cities. Content must integrate Zomato Gold perks seamlessly.' },
        { section: '3. Deliverables & Timeline', content: 'Deliverables: 3x Instagram Reels (45-60s), 6x Instagram Stories with links. All final cuts must be submitted to ColabRoom Escrow by 15 July 2026. Posting dates will be assigned by the Brand.' },
        { section: '4. Compensation', content: 'Brand agrees to pay a total of ₹2,85,000 INR. Funds have been deposited securely into ColabRoom Escrow and will be released within 48 hours of final milestone approval.' },
        { section: '5. Brand Safety & Compliance', content: 'Creator agrees to adhere strictly to ASCI guidelines regarding sponsored content (#Ad). Content must not contain any political, religious, or socially controversial statements.' },
        { section: '6. Cancellation & Kill Fee', content: 'If the Brand cancels this campaign post execution of this agreement but prior to publishing, Creator is entitled to a 25% kill fee (₹71,250 INR).' }
      ]
    }
  },
  {
    brand_name: 'Nike India',
    creator_name: 'Rithik',
    total_amount: 450000,
    content: {
      title: 'Nike Summer Runners Launch',
      amount: 450000,
      clauses: [
        { section: '1. Parties', content: 'This Agreement is entered into between Nike India ("Brand") and Rithik ("Creator").' },
        { section: '2. Campaign Overview', content: 'Creator will spearhead the "Summer Runners" digital campaign promoting the new Nike Air Zoom Pegasus 41. The narrative should focus on endurance and early morning runs.' },
        { section: '3. Deliverables', content: 'Creator will provide: One (1) dedicated YouTube vlog (10-15 mins) tracking a 10K run, and Two (2) YouTube Shorts extracted from the vlog. Creator must wear head-to-toe Nike apparel.' },
        { section: '4. Financial Terms', content: 'Total compensation is ₹4,50,000 INR. Milestone 1 (Script Approval): 20%. Milestone 2 (Final Video): 80% via ColabRoom Escrow.' },
        { section: '5. Usage Rights', content: 'Brand is granted full perpetual digital rights to repurpose, trim, and run paid media against the YouTube Shorts on all Meta and Google platforms globally.' },
        { section: '6. Exclusivity', content: 'Creator agrees to a 60-day strict exclusivity period during which they will not promote, wear, or endorse any direct competitor sportswear brands (e.g. Adidas, Puma, Under Armour).' }
      ]
    }
  },
  {
    brand_name: 'Samsung',
    creator_name: 'Rithik',
    total_amount: 150000,
    content: {
      title: 'Galaxy S26 Ultra Camera Review',
      amount: 150000,
      clauses: [
        { section: '1. Parties', content: 'This Agreement is between Samsung Electronics ("Brand") and Rithik ("Creator").' },
        { section: '2. Scope of Services', content: 'Creator will produce tech-focused review content showcasing the 200MP camera capabilities and AI features of the unreleased Galaxy S26 Ultra device.' },
        { section: '3. Deliverables', content: 'Four (4) vertical short-form videos optimized for TikTok and Instagram Reels. Videos must highlight Nightography, AI Object Eraser, and Zoom features.' },
        { section: '4. Non-Disclosure Agreement (NDA)', content: 'Creator acknowledges that the device is unreleased. Any leaks or premature publishing will result in immediate termination, forfeiture of compensation, and potential legal action.' },
        { section: '5. Compensation', content: 'Total payment of ₹1,50,000 INR. Funds held securely in ColabRoom Escrow. Creator also retains the review device post-campaign.' }
      ]
    }
  }
];

async function updateContracts() {
  console.log('Logging in...');
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: BRAND_EMAIL,
    password: PASSWORD,
  });
  
  if (authErr) {
    console.error('Login failed:', authErr.message);
    process.exit(1);
  }
  
  const { data: contracts, error: contractErr } = await supabase
    .from('contracts')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (contractErr || !contracts) {
    console.error('Error fetching contracts:', contractErr);
    process.exit(1);
  }
  
  console.log(`Found ${contracts.length} contracts.`);
  
  // Update contracts uniquely
  for (let i = 0; i < contracts.length; i++) {
    const template = CONTRACT_TEMPLATES[i % CONTRACT_TEMPLATES.length]; // cycle through templates
    const contractId = contracts[i].id;
    
    const { error: updateErr } = await supabase
      .from('contracts')
      .update({
        brand_name: template.brand_name,
        creator_name: template.creator_name,
        total_amount: template.total_amount,
        content: template.content,
        status: 'sent',
      })
      .eq('id', contractId);
      
    if (updateErr) {
      console.error(`Failed to update contract ${contractId}:`, updateErr);
    } else {
      console.log(`Updated contract ${contractId} to ${template.brand_name} × ${template.creator_name}`);
    }
  }
  
  console.log('Finished updating database!');
}

updateContracts().catch(console.error);
