export const CATEGORIES = [
  { id: 'all',         label: 'All Sounds',   emoji: '✨' },
  { id: 'alerts',      label: 'Alerts',       emoji: '🔔' },
  { id: 'transitions', label: 'Transitions',  emoji: '🌊' },
  { id: 'jingles',     label: 'Jingles',      emoji: '🎵' },
  { id: 'ui',          label: 'UI Sounds',    emoji: '⬡'  },
  { id: 'stingers',    label: 'Stingers',     emoji: '⚡' },
];

export const ROLES = [
  { id: 'buyer',   emoji: '🎧', title: 'Buyer',   desc: 'Browse & buy sounds' },
  { id: 'creator', emoji: '🎤', title: 'Creator', desc: 'Upload & sell sounds' },
];

export const NAV_LINKS = ['Browse', 'Creators', 'Pricing', 'Blog'];

export const EMAIL_RE    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
export const USERNAME_RE = /^[a-zA-Z0-9_]+$/;
export const CYRILLIC    = /[а-яёА-ЯЁ]/;
