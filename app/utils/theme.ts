// utils/theme.ts
import { Theme } from '@/contexts/ThemeContext';
import { StyleSheet } from 'react-native';

/**
 * Create styles that depend on the theme
 */
export function makeStyles<T extends Record<string, any>>(
  styles: (theme: Theme) => T
) {
  return (theme: Theme): T => {
    const resolved = styles(theme);
    return StyleSheet.create(resolved) as T;
  };
}

/**
 * Get a color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return `#${hex}${alpha}`;
}

/**
 * Utility to merge theme colors with custom styles
 */
export function mergeThemeStyles(
  theme: Theme,
  customStyles: any
) {
  return {
    ...customStyles,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    radius: theme.radius,
    shadows: theme.shadows,
  };
}

/**
 * Get contrast color for text
 */
export function getContrastColor(bgColor: string): string {
  // Convert hex to RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}