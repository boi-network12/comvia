import { View, Text } from 'react-native'
import React, { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSnackbar } from '@/contexts/SnackbarContext';
import { Tabs, useRouter } from 'expo-router';
import CustomTabs from '@/components/customs/CustomTabs';

export default function TabLayout() {
    const { user } = useAuth();
    const { showInfo } = useSnackbar();
    const router = useRouter();

    useEffect(() => {
        //  if user is null wait 10 minutes and redirect
        if (!user) {
            const timer = setTimeout(() => {
                if (!user) {
                    showInfo('Session expired. please log in again.')
                }
                router.replace('/')
            }, 10 * 60 * 1000);

            return () => clearTimeout(timer);
        }
    },[user, showInfo, router]);
    
  return (
    <Tabs
      tabBar={(props) => <CustomTabs {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
         name='dashboard/index'
         options={{ headerShown: false }}
      />
    </Tabs>
  )
}