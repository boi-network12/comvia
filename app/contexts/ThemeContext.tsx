//!! contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { shadows, themeColors } from "@/constants/ThemeColors";
import { radius, spacing, typography } from "@/constants/Typographies";

// Complete theme object
export const createTheme = (mode: 'light' | 'dark') => ({
  colors: themeColors[mode],
  typography,
  spacing,
  radius,
  shadows,
  mode,
});

export type Theme =  ReturnType<typeof createTheme>;

interface ThemeContextType {
    theme: Theme;
    mode: 'light' | 'dark';
    toggleTheme: () => void;
    setMode: (mode: 'light' | 'dark') => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = "@app_theme_mode";

export function ThemeProvider({ children }: { children: React.ReactNode }){
    const systemColorScheme = useColorScheme();
    const [mode, setMode] = useState<'light' | 'dark'>('dark'); // Default to dark like your splash screen
    const [isLoading, setIsLoading] = useState(true);

    // Load theme mode from AsyncStorage on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme === 'light' || savedTheme === 'dark') {
                    setMode(savedTheme);
                } else {
                    // Use system preference as fallback
                    setMode(systemColorScheme || 'dark');
                }
            } catch (error) {
                console.warn('Failed to load theme:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadTheme();
    },[]);

    // Save theme preference when it changes
    const handleSetMode = (newMode: 'light' | 'dark') => {
        setMode(newMode);
        AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(console.warn);
    };

    const toggleTheme = () => {
        handleSetMode(mode === 'light' ? 'dark' : 'light');
    };

    const theme = createTheme(mode);

    if (isLoading) {
        return null; // Or a loading component
    }


    return (
        <ThemeContext.Provider
        value={{
            theme,
            mode,
            toggleTheme,
            setMode: handleSetMode,
            isDark: mode === 'dark',
        }}
        >
        {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility hook for styled components
export function useThemeStyles<T extends Record<string, any>>(
  styles: (theme: Theme) => T
): T {
  const { theme } = useTheme();
  return styles(theme);
}

// Helper to create themed styles
export function createThemedStyles<T extends Record<string, any>>(
  styles: (theme: Theme) => T
) {
  return (theme: Theme) => styles(theme);
}