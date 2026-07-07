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
  visitorId?: string; // ← ADD THIS
}

// ✅ HELPER: Get or create persistent visitor ID
const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem('comvia_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('comvia_visitor_id', visitorId);
    console.log('🆕 [WIDGET] Created new visitor ID:', visitorId);
  } else {
    console.log('♻️ [WIDGET] Using existing visitor ID:', visitorId);
  }
  return visitorId;
};

let isInitializing = false;

// Global widget instance
let widgetInstance: ReactDOM.Root | null = null;
let widgetContainer: HTMLElement | null = null;
let isInitialized = false;

// Main initialization function
export function initComviaWidget(config: WidgetConfig = {}) {
  if (isInitializing) {
    console.log('⏳ Widget initialization already in progress...');
    return widgetContainer;
  }

  if (isInitialized) {
    console.log('💬 Widget already initialized');
    return widgetContainer;
  }

  isInitializing = true;

  // Merge with existing config
  const existingConfig = (window as any).comviaSettings || {};

  // Check for data-settings attribute on script tag
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

  // ✅ ENSURE visitorId is set
  if (!mergedConfig.visitorId) {
    mergedConfig.visitorId = getOrCreateVisitorId();
  }

  // Ensure apiUrl is set correctly
  if (!mergedConfig.apiUrl) {
    mergedConfig.apiUrl = import.meta.env.VITE_API_URL || 'https://comvia-backend-endpoint.vercel.app/api';
  }
  
  // Store config globally
  (window as any).comviaSettings = mergedConfig;

  console.log('💬 [WIDGET] Final config:', {
    ...mergedConfig,
    visitorId: mergedConfig.visitorId, // ← Log the visitor ID
  });

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
  console.log('💬 Comvia Widget initialized with visitor ID:', mergedConfig.visitorId);
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
// AUTO-INITIALIZATION
// ============================================================

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

  // ✅ Check for existing visitor ID in localStorage
  const existingVisitorId = localStorage.getItem('comvia_visitor_id');
  if (existingVisitorId) {
    config.visitorId = existingVisitorId;
    console.log('♻️ [WIDGET] Restored visitor ID from localStorage:', existingVisitorId);
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
// EXPOSE TO WINDOW
// ============================================================

(window as any).ComviaWidget = {
  init: initComviaWidget,
  destroy: destroyWidget,
  version: '1.0.0',
};

(window as any).initComviaWidget = initComviaWidget;
(window as any).destroyWidget = destroyWidget;

export default { 
  init: initComviaWidget, 
  destroy: destroyWidget,
  version: '1.0.0',
};