// app/_layout.tsx (root layout)
import React, { useEffect, useState } from 'react';
import { router, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { Host } from 'react-native-portalize';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import SplashScreenComponent from '@/components/customs/SplashScreen';
import 'react-native-reanimated';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemedView } from '@/components/customs/ThemedView';
import { ActivityIndicator } from 'react-native';
import { SnackbarProvider } from '@/contexts/SnackbarContext';

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { theme } = useTheme();
  const { state, isLoading, isAuthenticated } = useAuth();
  const [loaded] = useFonts({
    Roboto: require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });
  const [splashDone, setSplashDone] = useState(false);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Handle native splash screen
  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        // ignore errors
      }
    }
    prepare();
  }, []);

  // Hide native splash when fonts are loaded
  useEffect(() => {
    async function hideNativeSplash() {
      if (loaded) {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // ignore
        }
      }
    }
    hideNativeSplash();
  }, [loaded]);

  // Handle navigation based on auth state
  useEffect(() => {
    // Only navigate when:
    // 1. Fonts are loaded
    // 2. Splash animation is done
    // 3. Auth state is ready
    // 4. We haven't navigated yet
    if (loaded && splashDone && state.isReady && !isNavigationReady) {
      setIsNavigationReady(true);
      
      // Small delay to ensure everything is mounted
      setTimeout(() => {
        if (isAuthenticated) {
          console.log('🔐 User is authenticated, navigating to dashboard');
          router.replace('/dashboard');
        } else {
          console.log('👤 User is not authenticated, navigating to login');
          router.replace('/');
        }
      }, 100);
    }
  }, [loaded, splashDone, state.isReady, isAuthenticated, isNavigationReady]);

  // Show loading state while auth is being restored
  if (!state.isReady || isLoading) {
    return (
      <ThemedView style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  // Show custom splash screen until fonts are loaded
  if (!loaded || !splashDone) {
    return <SplashScreenComponent onAnimationComplete={() => setSplashDone(true)} />;
  }

  return (
    <Host>
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </Host>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SnackbarProvider>
          <AuthProvider>
            <RootLayoutContent />
          </AuthProvider>
        </SnackbarProvider>
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}