import type { Contract } from '../types';
import type { ContractData } from '../services/generateContractPdf';

function formatAgreementDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

const CLAUSES_MAMA: ContractData['clauses'] = [
  {
    section: '1. Parties',
    content:
      'This Influencer Collaboration Agreement ("Agreement") is entered into between Mamaearth Beauty Pvt. Ltd. ("Brand") and the named Creator. Creator\'s social handles and reach are as listed on ColabRoom.',
  },
  {
    section: '2. Deliverables',
    content:
      'Creator agrees to produce: (a) 1 Instagram Reel (60–90 sec) demonstrating product use; (b) 3 Instagram Stories with swipe-up link; (c) 1 YouTube Shorts (under 60 sec). All content must feature Mamaearth Vitamin C Face Serum with provided talking points.',
  },
  {
    section: '3. Timeline',
    content:
      'Draft content must be submitted via ColabRoom Campaign Room within 10 calendar days of agreement execution. Brand has 3 business days to review and provide feedback. Final content to be posted within 5 days of approval.',
  },
  {
    section: '4. Compensation',
    content:
      'Brand agrees to pay Creator the total fee stated in the summary. Payment is held in ColabRoom Escrow and released automatically within 24 hours of the content approval milestone.',
  },
  {
    section: '5. Content Rights & Usage',
    content:
      'Creator grants Brand a non-exclusive licence to repurpose and distribute approved content across Brand\'s own social channels for 6 months from posting date. Creator retains all copyright. Brand may not alter content without prior written consent.',
  },
  {
    section: '6. Exclusivity',
    content:
      'Creator agrees not to promote direct competitor skincare serums for a period of 30 days from the posting date of the final deliverable.',
  },
  {
    section: '7. Disclosure',
    content:
      'Creator must disclose the paid partnership using "#Ad" or "#Sponsored" in the caption of all posts, in compliance with ASCI guidelines and applicable advertising standards.',
  },
  {
    section: '8. Governing Law',
    content:
      'This Agreement shall be governed by the laws of India. Any dispute shall be subject to the exclusive jurisdiction of the courts of Mumbai, Maharashtra.',
  },
];

const CLAUSES_BOAT: ContractData['clauses'] = [
  {
    section: '1. Parties',
    content:
      'This Agreement is between boAt (Imagine Marketing Ltd.) ("Brand") and the named Creator for the campaign described on ColabRoom.',
  },
  {
    section: '2. Scope',
    content:
      'Creator will produce: 1 YouTube review (8–12 min) featuring the agreed product, plus 2 Instagram Reels (30–45 sec each). Mandatory brand hashtags and talking points will be supplied in the Campaign Room.',
  },
  {
    section: '3. Timeline & revisions',
    content:
      'First draft within 14 days of contract execution. Brand may request up to 2 reasonable revision rounds. Final publish dates coordinated via ColabRoom milestones.',
  },
  {
    section: '4. Compensation',
    content:
      'Total fee as shown in the summary, in INR, via ColabRoom Escrow. Release on milestone completion per platform rules.',
  },
  {
    section: '5. Compliance',
    content:
      'ASCI disclosure, no competitor placement in the same video, and accurate claims only. Brand-provided assets remain Brand property.',
  },
  {
    section: '6. Governing law',
    content: 'Laws of India; courts at Mumbai shall have jurisdiction.',
  },
];

const CLAUSES_ZOMATO: ContractData['clauses'] = [
  {
    section: '1. Parties',
    content:
      'This Agreement is between Zomato Ltd. ("Brand") and the named Creator for the city trail / food discovery series campaign on ColabRoom.',
  },
  {
    section: '2. Deliverables',
    content:
      'Three (3) Instagram Reels showcasing agreed city trail narrative, Zomato ordering moments, and on-screen disclosure. Shot list to be approved by Brand before filming.',
  },
  {
    section: '3. Kill fee',
    content:
      'If Brand cancels the campaign less than 7 days before scheduled shoot, Creator is entitled to 25% of the total fee as a kill fee, unless otherwise agreed in writing.',
  },
  {
    section: '4. Compensation',
    content:
      'Total fee in INR as per summary; held in Escrow until deliverables are approved and published per schedule.',
  },
  {
    section: '5. Rights & usage',
    content:
      'Brand may amplify Creator posts from Brand-owned handles for 12 months. Creator may not reuse Brand trademarks outside this campaign without consent.',
  },
  {
    section: '6. Law',
    content: 'Governed by the laws of India.',
  },
];

function clausesForContract(c: Contract): ContractData['clauses'] {
  switch (c.id) {
    case 'demo-001':
      return CLAUSES_MAMA;
    case 'contract_mock_boat':
      return CLAUSES_BOAT;
    case 'contract_mock_zomato':
      return CLAUSES_ZOMATO;
    default: {
      if (c.content?.clauses && Array.isArray(c.content.clauses)) {
        return c.content.clauses;
      }
      
      const dynamicClauses = Object.entries(c.content || {})
        .filter(([k]) => !['amount', 'currency', 'dueDate', 'title'].includes(k))
        .map(([k, v]) => ({
          section: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          content: String(v)
        }));

      return [
        {
          section: '1. Parties',
          content: `Agreement between ${c.brandName || 'Brand'} ("Brand") and ${c.creatorName || 'Creator'} ("Creator") via ColabRoom.`,
        },
        ...dynamicClauses,
        {
          section: 'Governing Law',
          content: 'Laws of India.',
        },
      ];
    }
  }
}

/** Payload for jsPDF (preview + download) from a catalog `Contract` row. */
export function buildContractPdfData(c: Contract): ContractData {
  return {
    id: c.id,
    brandName: c.brandName || 'Brand',
    creatorName: c.creatorName || 'Creator',
    totalAmount: c.totalAmount ?? (c as any).amount ?? c.content?.amount ?? 0,
    date: formatAgreementDate(c.createdAt),
    clauses: clausesForContract(c),
  };
}

export function contractShowsSignedPdf(status: Contract['status']): boolean {
  return status === 'signed' || status === 'executed';
}

export function contractNeedsCreatorSignature(status: Contract['status']): boolean {
  return status === 'sent' || status === 'under_review' || status === 'draft';
}
