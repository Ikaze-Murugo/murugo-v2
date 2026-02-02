import { MD3LightTheme } from 'react-native-paper';

// Use MD3 theme and only override colors/roundness.
// Do not override fonts: MD3 needs the full typescale (labelLarge, bodyMedium, etc.).
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2563EB',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    background: '#F9FAFB',
    surface: '#FFFFFF',
    error: '#EF4444',
    outline: '#9CA3AF',
    placeholder: '#6B7280', // used by LoginScreen, SignupScreen, PropertyCard, etc.
  },
  roundness: 8,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};
