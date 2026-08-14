import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native'
import React, { useRef } from 'react'
import {BottomTabBarProps} from "@react-navigation/bottom-tabs"
import { router, usePathname } from 'expo-router';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { ThemedView } from './ThemedView';
import { LinearGradient } from 'expo-linear-gradient';


import DashboardIcon from "../../assets/svgs/dashboard-icon.svg";
import { useTheme } from '@/contexts/ThemeContext';


const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define tab types
interface TabItem {
  name: string;
  icon: React.ComponentType<any>;
  label: string;
}


const CustomTabs: React.FC<BottomTabBarProps> = (props) => {
    const { theme, isDark } = useTheme();
    const pathname = usePathname();

    // Animation values for liquid effect
    const translateX = useRef(new Animated.Value(0)).current;
    const scaleX = useRef(new Animated.Value(1)).current;
    const bounceValue = useRef(new Animated.Value(1)).current;


    const tabs:  TabItem[] = [
        { name: "dashboard", icon: DashboardIcon, label: "Home" },
    ];

     // Find current tab index
    const currentIndex = tabs.findIndex(tab => pathname === `/${tab.name}`) || 0;
    const tabWidth = SCREEN_WIDTH / tabs.length;

    // Check if current screen should hide tabs
    const shouldHideTabs = pathname.startsWith('/instant/') || 
                            pathname === '/login' || 
                            pathname === '/signup';

    if (shouldHideTabs) return null;

    return (
        <View style={styles.container}>
            {tabs.map((tab, index) => {
                const isActive = pathname === `/${tab.name}`;
                const Icon = tab.icon;

                return (
                    <TouchableOpacity
                       key={index}
                       style={styles.tab}
                       onPress={() => router.push(`/${tab.name}`)}
                       activeOpacity={0.7}
                    >
                        <Icon
                           width={hp(2.9)}
                           height={hp(2.8)}
                        />
                    </TouchableOpacity>
                )
            })}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
    }
})

export default CustomTabs;