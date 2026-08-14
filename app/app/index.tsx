// app/index.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/customs/ThemedView';
import { ThemedText } from '@/components/customs/ThemedText';

export default function HomeScreen() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <ThemedView variant="screen">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.center}>
        <ThemedText variant="title" weight="bold">
          Welcome to Comvia
        </ThemedText>
        
        <ThemedText variant="body" muted style={styles.subtitle}>
          Communication, simplified.
        </ThemedText>
        
        <ThemedText 
          variant="label" 
          color={theme.colors.primary}
          style={styles.themeToggle}
          onPress={toggleTheme}
        >
          Toggle Theme ({isDark ? 'Dark' : 'Light'})
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  subtitle: {
    marginTop: 8,
  },
  themeToggle: {
    marginTop: 20,
    padding: 10,
    textDecorationLine: 'underline',
  },
});