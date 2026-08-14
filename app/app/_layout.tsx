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


SplashScreen.preventAutoHideAsync();


function RootLayoutContent() {
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
    if (loaded && splashDone) {
      router.replace('/starting-screen');
    }
  },[loaded, splashDone])

  // show custom splash screen until fonts are loaded
  if (!loaded || !splashDone) {
    return <SplashScreenComponent onAnimationComplete={() => setSplashDone(true)} />;
  }

  return (
    <Host>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="starting-screen" />
      </Stack>
    </Host>
  )
}

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto"/>
        <RootLayoutContent />
    </GestureHandlerRootView>
  );
}
