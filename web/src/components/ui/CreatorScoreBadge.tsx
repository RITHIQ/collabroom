import type { CreatorTier } from '../../types';

interface Props {
  score: number;
  tier: CreatorTier;
  size?: 'sm' | 'md';
}

const tierConfig = {
  rising: { label: 'Rising', className: 'score-rising', emoji: '🌱' },
  established: { label: 'Established', className: 'score-established', emoji: '⭐' },
  elite: { label: 'Elite', className: 'score-elite', emoji: '💜' },
  verified_pro: { label: 'Verified Pro', className: 'score-verified-pro', emoji: '✅' },
};

export default function CreatorScoreBadge({ score, tier, size = 'sm' }: Props) {
  const config = tierConfig[tier];
  return (
    <span className={`creator-score-badge ${config.className}`} style={{ fontSize: size === 'md' ? '0.82rem' : '0.72rem' }}>
      {config.emoji} {config.label} · {score}
    </span>
  );
}
