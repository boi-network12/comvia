// app/login.tsx
import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Linking
} from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { ThemedView } from '@/components/customs/ThemedView';
import { ThemedText } from '@/components/customs/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { theme, isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to dashboard
      router.replace('/dashboard');
    }, 1500);
  };

  return (
    <ThemedView variant="screen">
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* <SafeAreaView style={styles.safeArea}> */}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={styles.header}>
              <TouchableOpacity 
                onPress={() => router.back()}
                style={[styles.backButton, { backgroundColor: theme.colors.surfaceSecondary }]}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              
              <View style={styles.logoContainer}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.logoGradient}
                >
                  <Ionicons name="chatbubbles" size={32} color="#FFFFFF" />
                </LinearGradient>
              </View>

              <ThemedText variant="heading" weight="bold" style={styles.welcomeText}>
                Welcome Back! 👋
              </ThemedText>
              <ThemedText variant="body" muted style={styles.subtitle}>
                Sign in to continue managing your conversations
              </ThemedText>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <ThemedText variant="label" weight="medium" style={styles.inputLabel}>
                  Email Address
                </ThemedText>
                <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                  <Ionicons name="mail-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="you@example.com"
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordHeader}>
                  <ThemedText variant="label" weight="medium" style={styles.inputLabel}>
                    Password
                  </ThemedText>
                  <TouchableOpacity
                     onPress={() => Linking.openURL('https://comvia.vercel.app/forgot-password')}
                  >
                    <ThemedText variant="caption" color={theme.colors.primary} style={styles.forgotLink}>
                      Forgot?
                    </ThemedText>
                  </TouchableOpacity>
                </View>
                <View style={[styles.inputWrapper, { borderColor: theme.colors.border }]}>
                  <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.colors.text }]}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.colors.textMuted}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCorrect={false}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons 
                      name={showPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color={theme.colors.textMuted} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleLogin}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.primaryDark]}
                  style={styles.loginGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Ionicons name="reload" size={24} color="#FFFFFF" style={styles.loadingIcon} />
                  ) : (
                    <>
                      <ThemedText style={[styles.loginButtonText, { color: '#FFFFFF' }]}>
                        Sign In
                      </ThemedText>
                      <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
                <ThemedText variant="caption" muted style={styles.dividerText}>
                  Or continue with
                </ThemedText>
                <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
              </View>

              <View style={styles.socialButtons}>
                <TouchableOpacity style={[styles.socialButton, { borderColor: theme.colors.border }]}>
                  <Ionicons name="logo-google" size={24} color="#EA4335" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, { borderColor: theme.colors.border }]}>
                  <Ionicons name="logo-apple" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialButton, { borderColor: theme.colors.border }]}>
                  <Ionicons name="logo-github" size={24} color={theme.colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.footer}>
              <ThemedText variant="caption" muted>
                Don&apos;t have an account?{' '}
                <ThemedText 
                  variant="caption" 
                  weight="bold"  
                  color={theme.colors.primary}
                  onPress={() => Linking.openURL('https://comvia.vercel.app/signup')}
                >
                  Sign Up Free
                </ThemedText>
              </ThemedText>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      {/* </SafeAreaView> */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  logoGradient: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 13,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputIcon: {
    marginRight: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    height: 24,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loadingIcon: {
    // Animation handled by React Native
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
});