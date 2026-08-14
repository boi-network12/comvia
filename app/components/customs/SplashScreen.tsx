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
  const [displayText, setDisplayText] = useState('');

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const dotOpacity = useRef(new Animated.Value(0)).current;

  const fullText = 'comvia';

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    let index = 0;

    const interval = setInterval(() => {
      if (index < fullText.length) {
        setDisplayText((prev) => prev + fullText[index]);
        index++;
      } else {
        clearInterval(interval);

        // Loading dots fade in
        Animated.timing(dotOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        setTimeout(() => {
          onAnimationComplete();
        }, 700);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [onAnimationComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Center content */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Text style={styles.logoText}>{displayText}</Text>

          {/* Small accent line */}
          <View style={styles.accentLine} />

          {/* Loading dots */}
          <Animated.View
            style={[
              styles.loadingContainer,
              {
                opacity: dotOpacity,
              },
            ]}
          >
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </Animated.View>
        </Animated.View>

        {/* Bottom branding */}
        <Text style={styles.tagline}>
          Communication, simplified.
        </Text>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoContainer: {
    alignItems: 'center',
  },

  logoText: {
    color: '#fff',
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: -2,
  },

  accentLine: {
    width: 32,
    height: 3,
    borderRadius: 10,
    backgroundColor: '#fff',
    marginTop: 12,
  },

  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 28,
  },

  dot: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#fff',
    opacity: 0.7,
  },

  tagline: {
    position: 'absolute',
    bottom: 40,
    color: '#666',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});