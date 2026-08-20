import { useAppStore } from '@/store/appStore';

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceMuted: '#EEF2F7',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#CBD5E1',
  primary: '#0F766E',
  primaryDark: '#115E59',
  danger: '#DC2626',
  warning: '#D97706',
  onlineBanner: '#DCFCE7',
  offlineBanner: '#FEF3C7'
};

export const darkColors = {
  background: '#101418',
  surface: '#182026',
  surfaceMuted: '#26313A',
  text: '#F8FAFC',
  textMuted: '#A9B7C6',
  border: '#3A4652',
  primary: '#2DD4BF',
  primaryDark: '#14B8A6',
  danger: '#F87171',
  warning: '#F59E0B',
  onlineBanner: '#064E3B',
  offlineBanner: '#78350F'
};

export const colors = lightColors;

export type AppColors = typeof lightColors;

export function useTheme() {
  const theme = useAppStore((state) => state.theme);

  return {
    theme,
    colors: theme === 'dark' ? darkColors : lightColors,
    isDark: theme === 'dark'
  };
}

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32
};
