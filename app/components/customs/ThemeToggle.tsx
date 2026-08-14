// components/ThemeToggle.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemedText } from './ThemedText';

export function ThemeToggle() {
  const { mode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: theme.colors.surfaceSecondary }]} 
      onPress={toggleTheme}
    >
      <ThemedText variant="label">
        {mode === 'dark' ? '🌙 Dark' : '☀️ Light'}
      </ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});