// app/[...unmatched].tsx
import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/customs/ThemedView';
import { ThemedText } from '@/components/customs/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';

const { width } = Dimensions.get('window');

export default function UnmatchedScreen() {
  const { theme, isDark } = useTheme();
  const pathname = usePathname();

  return (
    <ThemedView variant="screen" style={styles.container}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* 404 Icon */}
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
            <Ionicons name="compass-outline" size={64} color={theme.colors.primary} />
          </View>

          {/* Error Code */}
          <ThemedText variant="title" weight="bold" style={styles.errorCode}>
            404
          </ThemedText>

          {/* Message */}
          <ThemedText variant="heading" weight="bold" style={styles.title}>
            Page not found
          </ThemedText>
          
          <ThemedText variant="body" muted style={styles.description}>
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </ThemedText>

          {/* Show the attempted path (optional - helpful for debugging) */}
          {pathname && pathname !== '/[...unmatched]' && (
            <View style={[styles.pathContainer, { backgroundColor: theme.colors.surfaceSecondary }]}>
              <ThemedText variant="caption" muted style={styles.pathLabel}>
                Attempted path:
              </ThemedText>
              <ThemedText variant="caption" weight="medium" style={[styles.pathValue, { color: theme.colors.text }]}>
                {pathname}
              </ThemedText>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.replace('/')}
              activeOpacity={0.8}
            >
              <Ionicons name="home-outline" size={20} color="#FFFFFF" />
              <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
                Go home
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.secondaryButton, { borderColor: theme.colors.border }]}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back-outline" size={20} color={theme.colors.textSecondary} />
              <ThemedText variant="body" color={theme.colors.textSecondary}>
                Go back
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Quick Links */}
          <View style={styles.quickLinks}>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => router.push('/')}>
                <ThemedText variant="caption" color={theme.colors.primary} style={styles.link}>
                  Home
                </ThemedText>
              </TouchableOpacity>
              
              <View style={[styles.linkDivider, { backgroundColor: theme.colors.border }]} />
              
              <TouchableOpacity onPress={() => router.push('/login')}>
                <ThemedText variant="caption" color={theme.colors.primary} style={styles.link}>
                  Sign in
                </ThemedText>
              </TouchableOpacity>
              
              <View style={[styles.linkDivider, { backgroundColor: theme.colors.border }]} />
              
              <TouchableOpacity onPress={() => router.push('/signup')}>
                <ThemedText variant="caption" color={theme.colors.primary} style={styles.link}>
                  Create account
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorCode: {
    fontSize: 64,
    fontWeight: '700',
    letterSpacing: -2,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    maxWidth: width * 0.8,
    lineHeight: 22,
  },
  pathContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 32,
    maxWidth: width * 0.85,
  },
  pathLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  pathValue: {
    fontSize: 13,
    textAlign: 'center',
  },
  actions: {
    gap: 12,
    width: '100%',
    maxWidth: 280,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  quickLinks: {
    marginTop: 48,
    width: '100%',
    maxWidth: 280,
  },
  divider: {
    height: 1,
    marginBottom: 24,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  link: {
    fontSize: 13,
    fontWeight: '500',
  },
  linkDivider: {
    width: 1,
    height: 12,
  },
});