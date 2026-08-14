// components/ThemedText.tsx
import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemedTextProps extends TextProps {
  variant?: 'title' | 'heading' | 'subtitle' | 'body' | 'caption' | 'label';
  color?: string;
  weight?: 'thin' | 'light' | 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  muted?: boolean;
}

export function ThemedText({ 
  variant = 'body',
  color,
  weight = 'regular',
  align = 'left',
  muted = false,
  style,
  ...props 
}: ThemedTextProps) {
  const { theme } = useTheme();
  
  const getFontSize = () => {
    const sizes = theme.typography.sizes;
    switch (variant) {
      case 'title':
        return sizes['3xl'];
      case 'heading':
        return sizes['2xl'];
      case 'subtitle':
        return sizes.xl;
      case 'body':
        return sizes.base;
      case 'caption':
        return sizes.sm;
      case 'label':
        return sizes.xs;
      default:
        return sizes.base;
    }
  };
  
  const getFontWeight = () => {
    const weights = theme.typography.weights;
    return weights[weight] || weights.regular;
  };
  
  const getColor = () => {
    if (color) return color;
    if (muted) return theme.colors.textMuted;
    return theme.colors.text;
  };
  
  return (
    <Text
      style={[
        {
          color: getColor(),
          fontSize: getFontSize(),
          fontWeight: getFontWeight(),
          textAlign: align,
        },
        variant === 'title' && { letterSpacing: -1 },
        style,
      ]}
      {...props}
    />
  );
}