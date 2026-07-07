// widget/src/widget.tsx
import "./polyfills";

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Widget configuration interface
export interface WidgetConfig {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
  icon?: string;
  companyName?: string;
  companyLogo?: string;
  apiUrl?: string;
  socketUrl?: string;
  welcomeMessage?: string;
  quickReplies?: string[];
  font?: string;
  companyId?: string;
}

let isInitializing = false; // ✅ Add this

// Global widget instance
let widgetInstance: ReactDOM.Root | null = null;
let widgetContainer: HTMLElement | null = null;
let isInitialized = false;

// Main initialization function
export function initComviaWidget(config: WidgetConfig = {}) {
  // ✅ Check if already initializing
  if (isInitializing) {
    console.log('⏳ Widget initialization already in progress...');
    return widgetContainer;
  }

  // Don't initialize twice
  if (isInitialized) {
    console.log('💬 Widget already initialized');
    return widgetContainer;
  }

  isInitializing = true;

  // Merge with existing config
  const existingConfig = (window as any).comviaSettings || {};

  // ✅ Check for data-settings attribute on script tag
  const scripts = document.querySelectorAll('script');
  let settingsAttr = null;
  for (const script of scripts) {
    const attr = script.getAttribute('data-settings');
    if (attr) {
      settingsAttr = attr;
      break;
    }
  }

  let parsedSettings = {};
  if (settingsAttr) {
    try {
      parsedSettings = JSON.parse(decodeURIComponent(settingsAttr));
      console.log('📦 [WIDGET] Parsed settings from data-settings:', parsedSettings);
    } catch (e) {
      console.warn('⚠️ [WIDGET] Failed to parse data-settings:', e);
    }
  }

  const mergedConfig = { ...parsedSettings, ...existingConfig, ...config };

  // ✅ Ensure apiUrl is set correctly
  if (!mergedConfig.apiUrl) {
    mergedConfig.apiUrl = import.meta.env.VITE_API_URL || 'https://comvia-backend-endpoint.vercel.app/api';
  }
  
  // Store config globally
  (window as any).comviaSettings = mergedConfig;

  console.log('💬 [WIDGET] Final config:', mergedConfig);

  // Remove existing widget if any
  destroyWidget();

  // Create container
  widgetContainer = document.createElement('div');
  widgetContainer.id = 'comvia-widget-root';
  document.body.appendChild(widgetContainer);

  // Render widget
  widgetInstance = ReactDOM.createRoot(widgetContainer);
  widgetInstance.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  isInitialized = true;
  console.log('💬 Comvia Widget initialized with config:', mergedConfig);
  return widgetContainer;
}

// Destroy widget
export function destroyWidget() {
  if (widgetInstance) {
    widgetInstance.unmount();
    widgetInstance = null;
  }
  if (widgetContainer && widgetContainer.parentNode) {
    widgetContainer.parentNode.removeChild(widgetContainer);
    widgetContainer = null;
  }
  isInitialized = false;
}

// ============================================================
// ✅ IMPROVED: Better auto-initialization with multiple methods
// ============================================================

// (function autoInit() {
//   // Method 1: Check for window.comviaSettings
//   const config = (window as any).comviaSettings || {};

//   // Method 2: Check for data attributes on script tag
//   const scripts = document.querySelectorAll('script');
//   let currentScript: HTMLScriptElement | null = null;
  
//   for (const script of scripts) {
//     if (script.src && script.src.includes('comvia-widget')) {
//       currentScript = script;
//       break;
//     }
//   }

//   if (currentScript) {
//     const dataConfig = (currentScript as HTMLElement).dataset;
//     const mappedConfig: Record<string, any> = {};
//     Object.keys(dataConfig).forEach(key => {
//       const value = dataConfig[key];
//       if (key === 'position') mappedConfig.position = value;
//       else if (key === 'color') mappedConfig.color = value;
//       else if (key === 'icon') mappedConfig.icon = value;
//       else if (key === 'companyName') mappedConfig.companyName = value;
//       else if (key === 'companyLogo') mappedConfig.companyLogo = value;
//       else if (key === 'apiUrl') mappedConfig.apiUrl = value;
//       else if (key === 'socketUrl') mappedConfig.socketUrl = value;
//       else if (key === 'welcomeMessage') mappedConfig.welcomeMessage = value;
//       else if (key === 'font') mappedConfig.font = value;
//       else if (key === 'companyId') mappedConfig.companyId = value;
//       else if (key === 'quickReplies' && value) {
//         try {
//           mappedConfig.quickReplies = JSON.parse(value);
//         } catch {
//           mappedConfig.quickReplies = value.split(',').map(s => s.trim());
//         }
//       }
//     });
//     Object.assign(config, mappedConfig);
//   }

//   // Method 3: Check for URL parameters (for testing)
//   try {
//     const params = new URLSearchParams(window.location.search);
//     const settingsParam = params.get('comvia_settings');
//     if (settingsParam) {
//       const urlConfig = JSON.parse(decodeURIComponent(settingsParam));
//       Object.assign(config, urlConfig);
//     }
//   } catch (e) {
//     // Ignore URL parsing errors
//   }

//   // ✅ Check if we should auto-init
//   const shouldAutoInit = config.position || config.color || config.companyName || config.companyId;
  
//   if (shouldAutoInit) {
//     const initFn = () => {
//       // Wait a tiny bit to ensure DOM is ready
//       setTimeout(() => {
//         initComviaWidget(config);
//       }, 10);
//     };

//     if (document.readyState === 'loading') {
//       document.addEventListener('DOMContentLoaded', initFn);
//     } else if (document.readyState === 'complete') {
//       initFn();
//     } else {
//       // DOM is interactive but not complete yet
//       if (document.body) {
//         initFn();
//       } else {
//         document.addEventListener('DOMContentLoaded', initFn);
//       }
//     }
//   }
// })();

   (function autoInit() {
  const config = (window as any).comviaSettings || {};

  // Check for data-settings attribute
  const scripts = document.querySelectorAll('script');
  let settingsAttr = null;
  for (const script of scripts) {
    const attr = script.getAttribute('data-settings');
    if (attr) {
      settingsAttr = attr;
      break;
    }
  }
  
  if (settingsAttr) {
    try {
      const parsed = JSON.parse(decodeURIComponent(settingsAttr));
      Object.assign(config, parsed);
    } catch (e) {
      console.warn('⚠️ Failed to parse data-settings:', e);
    }
  }

  const shouldAutoInit = config.position || config.color || config.companyName || config.companyId;
  
  if (shouldAutoInit) {
    const initFn = () => {
      setTimeout(() => {
        initComviaWidget(config);
      }, 10);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initFn);
    } else if (document.readyState === 'complete') {
      initFn();
    } else {
      if (document.body) {
        initFn();
      } else {
        document.addEventListener('DOMContentLoaded', initFn);
      }
    }
  }
})();

// ============================================================
// ✅ IMPROVED: Multiple exposure methods for maximum compatibility
// ============================================================

// 1. Standard: ComviaWidget object
(window as any).ComviaWidget = {
  init: initComviaWidget,
  destroy: destroyWidget,
  version: '1.0.0',
};

// 2. Direct functions (backward compatibility)
(window as any).initComviaWidget = initComviaWidget;
(window as any).destroyWidget = destroyWidget;

// 3. For module imports (if someone uses import)
export default { 
  init: initComviaWidget, 
  destroy: destroyWidget,
  version: '1.0.0',
};