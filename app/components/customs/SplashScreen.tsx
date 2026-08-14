import { useTheme } from '@/contexts/ThemeContext';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onAnimationComplete: () => void;
}

export default function SplashScreen({
  onAnimationComplete,
}: SplashScreenProps) {
  const { theme } = useTheme();
  const [displayText, setDisplayText] = useState('');

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    const fullText = 'comvia';
    let index = 0;

    // Logo animation
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),

      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Typing animation
    const typingInterval = setInterval(() => {
      if (index < fullText.length) {
        index += 1;
        setDisplayText(fullText.substring(0, index));
      } else {
        clearInterval(typingInterval);

        setTimeout(() => {
          onAnimationComplete();
        }, 700);
      }
    }, 150);

    return () => {
      clearInterval(typingInterval);
    };
  }, []);

  return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}
          >
            <Text style={[styles.logoText, { color: theme.colors.text }]}>
              {displayText}
            </Text>

            <View style={[styles.accentLine, { backgroundColor: theme.colors.primary }]} />

            <View style={styles.loadingContainer}>
              <View style={[styles.dot, { backgroundColor: theme.colors.text, opacity: 0.7 }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.text, opacity: 0.7 }]} />
              <View style={[styles.dot, { backgroundColor: theme.colors.text, opacity: 0.7 }]} />
            </View>
          </Animated.View>

          <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>
            Communication, simplified.
          </Text>
        </View>
      </SafeAreaView>
    );
  }


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
  },
  accentLine: {
    width: 32,
    height: 3,
    borderRadius: 10,
    marginTop: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 28,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
  },
  tagline: {
    position: 'absolute',
    bottom: 40,
    fontSize: 12,
    letterSpacing: 0.5,
  },
});