export const Colors = {
  background: '#0A0A14',
  surface: '#12121F',
  surfaceHighlight: '#1C1C30',
  primary: '#4F6EF7',
  primaryDark: '#3350D4',
  text: '#FFFFFF',
  textSecondary: '#A0A8C8',
  error: '#E84560',
  border: '#1C1C30',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
