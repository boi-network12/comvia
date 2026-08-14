// contexts/SnackbarContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity, 
  Dimensions,
  Platform 
} from 'react-native';
import { useTheme } from './ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

type SnackbarType = 'success' | 'error' | 'warning' | 'info' | 'default';

interface SnackbarOptions {
  message: string;
  type?: SnackbarType;
  duration?: number; // in milliseconds
  action?: {
    label: string;
    onPress: () => void;
  };
  position?: 'top' | 'bottom';
}

interface SnackbarContextType {
  show: (options: string | SnackbarOptions) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  hide: () => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<SnackbarType>('default');
  const [action, setAction] = useState<SnackbarOptions['action']>(undefined);
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom');
  
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
        return 'information-circle';
      default:
        return 'notifications';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: theme.colors.success + '15',
          border: theme.colors.success,
          icon: theme.colors.success,
          text: theme.colors.text,
        };
      case 'error':
        return {
          bg: theme.colors.error + '15',
          border: theme.colors.error,
          icon: theme.colors.error,
          text: theme.colors.text,
        };
      case 'warning':
        return {
          bg: theme.colors.warning + '15',
          border: theme.colors.warning,
          icon: theme.colors.warning,
          text: theme.colors.text,
        };
      case 'info':
        return {
          bg: theme.colors.info + '15',
          border: theme.colors.info,
          icon: theme.colors.info,
          text: theme.colors.text,
        };
      default:
        return {
          bg: theme.colors.surfaceSecondary,
          border: theme.colors.border,
          icon: theme.colors.textMuted,
          text: theme.colors.text,
        };
    }
  };

  const show = useCallback((options: string | SnackbarOptions) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    let opts: SnackbarOptions;
    if (typeof options === 'string') {
      opts = { message: options };
    } else {
      opts = options;
    }

    const {
      message: msg,
      type: t = 'default',
      duration = 3000,
      action: act,
      position: pos = 'bottom',
    } = opts;

    setMessage(msg);
    setType(t);
    setAction(act);
    setPosition(pos);
    setVisible(true);

    // Animate in
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto hide
    if (duration > 0) {
      timeoutRef.current = setTimeout(() => {
        hide();
      }, duration);
    }
  }, []);

  const hide = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: position === 'top' ? -100 : 100,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      setMessage('');
      setAction(undefined);
    });
  }, [position]);

  // Helper methods
  const showSuccess = useCallback((message: string, duration?: number) => {
    show({ message, type: 'success', duration });
  }, [show]);

  const showError = useCallback((message: string, duration?: number) => {
    show({ message, type: 'error', duration });
  }, [show]);

  const showWarning = useCallback((message: string, duration?: number) => {
    show({ message, type: 'warning', duration });
  }, [show]);

  const showInfo = useCallback((message: string, duration?: number) => {
    show({ message, type: 'info', duration });
  }, [show]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const colors = getColors();

  const positionStyle = position === 'top' 
    ? { top: Platform.OS === 'ios' ? 44 : 0 }
    : { bottom: 0 };

  return (
    <SnackbarContext.Provider value={{ show, showSuccess, showError, showWarning, showInfo, hide }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            positionStyle,
            {
              opacity,
              transform: [{ translateY }],
            },
          ]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.snackbar,
              {
                backgroundColor: theme.colors.background,
                borderLeftColor: colors.border,
                borderWidth: 1,
                borderColor: theme.colors.border,
                shadowColor: theme.mode === 'dark' ? '#000' : '#000',
              },
              theme.mode === 'dark' ? styles.shadowDark : styles.shadowLight,
            ]}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.bg }]}>
              <Ionicons name={getIconName()} size={20} color={colors.icon} />
            </View>
            
            <Text style={[styles.message, { color: colors.text }]} numberOfLines={2}>
              {message}
            </Text>

            {action && (
              <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
                <Text style={[styles.actionLabel, { color: theme.colors.primary }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={hide} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={theme.colors.textMuted} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const context = useContext(SnackbarContext);
  if (context === undefined) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    alignItems: 'center',
    pointerEvents: 'box-none',
    zIndex: 9999,
  },
  snackbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    maxWidth: 500,
    minHeight: 56,
  },
  shadowLight: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  shadowDark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  actionButton: {
    marginLeft: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    marginLeft: 4,
  },
});