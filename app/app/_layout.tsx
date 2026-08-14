//  this is the root layout of the app. It wraps all pages and layouts in the app. You can use this to keep state when navigating between pages, or to add a persistent layout that you want to share across all pages.
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
  const { state, isLoading } = useAuth();
  const [loaded] = useFonts({
    Roboto: require('../assets/fonts/Roboto-Regular.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto-Medium.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto-Bold.ttf'),
  });
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Prevent the native splash screen from auto-hiding while the app loads resources
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
      } catch (e) {
        // ignore errors (native module may not be available in some environments)
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    // Once fonts (and other resources) are loaded, hide the native splash so the React tree is visible
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


  // i will still add state when authenticated 
  useEffect(() => {
    if (loaded && splashDone && state.isReady) {
      if (state.isAuth) {
        router.replace('/dashboard');
      } else {
        router.replace('/');
      }
    }
  }, [loaded, splashDone, state.isReady, state.isAuth]);

  // Show loading state
  if (isLoading || !state.isReady) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }


  // show custom splash screen until fonts are loaded
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
