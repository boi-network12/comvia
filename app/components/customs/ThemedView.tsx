// components/ThemedView.tsx
import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ThemedViewProps extends ViewProps {
  variant?: 'screen' | 'card' | 'surface' | 'transparent';
  noPadding?: boolean;
}

export function ThemedView({ 
  variant = 'screen', 
  noPadding = false, 
  style, 
  ...props 
}: ThemedViewProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  
  const getBackgroundColor = () => {
    switch (variant) {
      case 'screen':
        return theme.colors.background;
      case 'card':
        return theme.colors.card;
      case 'surface':
        return theme.colors.surfaceSecondary;
      case 'transparent':
        return 'transparent';
      default:
        return theme.colors.background;
    }
  };
  
  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          paddingTop: noPadding ? 0 : insets.top,
          paddingBottom: noPadding ? 0 : insets.bottom,
          flex: 1,
        },
        style,
      ]}
      {...props}
    />
  );
}