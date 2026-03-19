export const Colors = {
  background: '#121212',
  surface: '#1E1E1E',
  surfaceHighlight: '#282828',
  primary: '#1DB954',
  primaryDark: '#158a3e',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  error: '#E91429',
  border: '#282828',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;
