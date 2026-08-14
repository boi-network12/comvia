// app/index.tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/customs/ThemedView';
import { ThemedText } from '@/components/customs/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function GetStartedScreen() {
  const { theme, isDark } = useTheme();

  return (
    <ThemedView variant="screen" style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={[styles.logoIcon, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="chatbubbles" size={22} color="#FFFFFF" />
              </View>
              <ThemedText variant="heading" weight="bold" style={styles.logoText}>
                Comvia
              </ThemedText>
            </View>
          </View>

          {/* Hero */}
          <View style={styles.hero}>
            <ThemedText variant="title" weight="bold" style={styles.heroTitle}>
              Team communication, simplified
            </ThemedText>
            
            <ThemedText variant="body" muted style={styles.heroDescription}>
              One platform for conversations, insights, and collaboration.
              Built for teams who want to move faster.
            </ThemedText>

            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Get started
              </ThemedText>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Features - Clean grid */}
          <View style={styles.features}>
            <View style={[styles.featureItem, { borderColor: theme.colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.primary + '10' }]}>
                <Ionicons name="flash" size={20} color={theme.colors.primary} />
              </View>
              <ThemedText variant="subtitle" weight="semibold" style={styles.featureLabel}>
                Real-time
              </ThemedText>
              <ThemedText variant="caption" muted style={styles.featureDescription}>
                Instant messages and updates
              </ThemedText>
            </View>

            <View style={[styles.featureItem, { borderColor: theme.colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.success + '10' }]}>
                <Ionicons name="analytics" size={20} color={theme.colors.success} />
              </View>
              <ThemedText variant="subtitle" weight="semibold" style={styles.featureLabel}>
                Insights
              </ThemedText>
              <ThemedText variant="caption" muted style={styles.featureDescription}>
                Understand your team&apos;s work
              </ThemedText>
            </View>

            <View style={[styles.featureItem, { borderColor: theme.colors.border }]}>
              <View style={[styles.featureIcon, { backgroundColor: theme.colors.warning + '10' }]}>
                <Ionicons name="shield" size={20} color={theme.colors.warning} />
              </View>
              <ThemedText variant="subtitle" weight="semibold" style={styles.featureLabel}>
                Secure
              </ThemedText>
              <ThemedText variant="caption" muted style={styles.featureDescription}>
                Enterprise-grade protection
              </ThemedText>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <ThemedText variant="caption" muted style={styles.footerText}>
              Already have an account? 
              <ThemedText 
                variant="caption" 
                weight="bold" 
                color={theme.colors.primary}
                onPress={() => router.push('/login')}
              >
                {' '}Sign in
              </ThemedText>
            </ThemedText>

            <View style={styles.footerLinks}>
              <ThemedText variant="caption" muted style={styles.footerLink}>
                Privacy
              </ThemedText>
              <View style={[styles.footerDivider, { backgroundColor: theme.colors.border }]} />
              <ThemedText variant="caption" muted style={styles.footerLink}>
                Terms
              </ThemedText>
              <View style={[styles.footerDivider, { backgroundColor: theme.colors.border }]} />
              <ThemedText variant="caption" muted style={styles.footerLink}>
                Support
              </ThemedText>
            </View>
          </View>
        </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 48,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  hero: {
    marginBottom: 48,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -1,
    marginBottom: 12,
    maxWidth: width * 0.9,
  },
  heroDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
    maxWidth: width * 0.85,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
    alignSelf: 'flex-start',
    minWidth: 160,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 48,
  },
  featureItem: {
    flex: 1,
    minWidth: (width - 60) / 3 - 8,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureLabel: {
    fontSize: 15,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
    gap: 16,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  footerLink: {
    fontSize: 12,
  },
  footerDivider: {
    width: 1,
    height: 12,
  },
});