export const TIERS = {
  bronze:   { label: 'Bronze',   emoji: '🥉', color: '#cd7f32', creditsRate: 0.05, minSpend: 0 },
  silver:   { label: 'Silver',   emoji: '🥈', color: '#a8a9ad', creditsRate: 0.07, minSpend: 500 },
  gold:     { label: 'Gold',     emoji: '🥇', color: '#ffd700', creditsRate: 0.10, minSpend: 1500 },
  platinum: { label: 'Platinum', emoji: '💎', color: '#e0f7ff', creditsRate: 0.12, minSpend: 4000 },
};

export const TIER_PERKS = {
  bronze:   ['5% credits on every booking', 'Access to Exchange marketplace'],
  silver:   ['7% credits', 'Free Price Locks ($10 waived)', 'Exchange fee 8%'],
  gold:     ['10% credits', 'Flash Drop early access (+5 min)', 'Free room upgrade requests', 'Exchange fee 6%'],
  platinum: ['12% credits', 'Flash Drop early access (+15 min)', 'Guaranteed upgrades', 'Priority support', 'Exchange fee 5%'],
};

export function getTier(totalSpend) {
  if (totalSpend >= 4000) return 'platinum';
  if (totalSpend >= 1500) return 'gold';
  if (totalSpend >= 500) return 'silver';
  return 'bronze';
}

export function getCreditsRate(tier) {
  return TIERS[tier]?.creditsRate ?? 0.05;
}

export function getNextTier(totalSpend) {
  if (totalSpend >= 4000) return null;
  if (totalSpend >= 1500) return { name: 'Platinum', remaining: 4000 - totalSpend };
  if (totalSpend >= 500)  return { name: 'Gold',     remaining: 1500 - totalSpend };
  return { name: 'Silver', remaining: 500 - totalSpend };
}
