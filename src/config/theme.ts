// src/config/theme.ts
// Central design tokens — matches the UI prototype

export const colors = {
  greenDeep: '#1B4332',
  greenMid: '#2D6A4F',
  greenLight: '#40916C',
  greenPale: '#D8F3DC',
  amber: '#F4A533',
  amberDark: '#D4861A',
  offWhite: '#F7F4EF',
  warmGray: '#E8E4DD',
  textDark: '#1A1A18',
  textMid: '#555550',
  textLight: '#8A8A82',
  red: '#C0392B',
  blue: '#2563EB',
  white: '#FFFFFF',
  // Status colors
  statusPendingBg: '#FEF3C7',
  statusPendingText: '#92400E',
  statusProgressBg: '#DBEAFE',
  statusProgressText: '#1E40AF',
  statusDoneBg: '#D8F3DC',
  statusDoneText: '#1B4332',
};

export const fonts = {
  // In RN we use system fonts. Add custom fonts via react-native-fonts if desired.
  heading: 'System',
  body: 'System',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
};
