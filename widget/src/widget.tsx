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
  visitorId?: string;
}

// ✅ HELPER: Get or create persistent visitor ID
const getOrCreateVisitorId = (): string => {
  let visitorId = localStorage.getItem('comvia_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('comvia_visitor_id', visitorId);
  }
  return visitorId;
};

// ✅ VALIDATION: Check if company ID is valid
async function validateCompanyId(companyId: string, apiUrl: string): Promise<{ valid: boolean; error?: string; data?: any }> {
  if (!companyId || companyId.trim() === '') {
    return {
      valid: false,
      error: 'Company ID is required. Please provide a valid company ID.'
    };
  }

  try {
    const response = await fetch(`${apiUrl}/company/${companyId}/widget`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          error: `❌ Company "${companyId}" not found. Please check your company ID.`
        };
      }
      
      const errorData = await response.json().catch(() => ({}));
      return {
        valid: false,
        error: errorData.message || `Failed to validate company (status: ${response.status})`
      };
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        valid: false,
        error: 'Invalid response from server.'
      };
    }

    return {
      valid: true,
      data: result.data
    };
  } catch (error: any) {
    console.error('❌ [WIDGET] Company validation error:', error);
    return {
      valid: false,
      error: error.message || 'Network error. Please check your internet connection.'
    };
  }
}

// ✅ ERROR UI: Show error message
function showErrorWidget(errorMessage: string, config: WidgetConfig): void {
  // Remove existing widget if any
  const existingContainer = document.getElementById('comvia-widget-root');
  if (existingContainer) {
    existingContainer.remove();
  }

  // Create container
  const container = document.createElement('div');
  container.id = 'comvia-widget-root';
  document.body.appendChild(container);

  // Get color from config or use default
  const color = config.color || '#F97316';

  // Create error UI
  const errorHtml = `
    <div id="comvia-error-widget" style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 99999;
      max-width: 400px;
      width: calc(100% - 48px);
      background: white;
      border-radius: 16px;
      padding: 20px 24px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
      border-left: 4px solid #dc2626;
      font-family: ${config.font === 'inter' ? 'Inter, system-ui, sans-serif' : 'system-ui, sans-serif'};
      animation: slideIn 0.3s ease-out;
    ">
      <style>
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
      <div style="display: flex; align-items: flex-start; gap: 12px;">
        <div style="
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          background: #fee2e2;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        ">
          ⚠️
        </div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="
            margin: 0 0 4px 0;
            font-size: 15px;
            font-weight: 600;
            color: #dc2626;
          ">
            Widget Configuration Error
          </h4>
          <p style="
            margin: 0 0 12px 0;
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
          ">
            ${errorMessage}
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" style="
              padding: 6px 16px;
              background: #f3f4f6;
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 500;
              color: #374151;
              cursor: pointer;
              transition: background 0.2s;
            ">
              Dismiss
            </button>
            <button onclick="document.getElementById('comvia-error-widget').parentElement.remove()" style="
              padding: 6px 16px;
              background: ${color};
              border: none;
              border-radius: 8px;
              font-size: 12px;
              font-weight: 500;
              color: white;
              cursor: pointer;
              transition: opacity 0.2s;
            ">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = errorHtml;

  // Also store error state globally for debugging
  (window as any).__comviaWidgetError = {
    hasError: true,
    message: errorMessage,
    timestamp: new Date().toISOString()
  };

  console.error('❌ [WIDGET] Widget initialization failed:', errorMessage);
}

let isInitializing = false;
let widgetInstance: ReactDOM.Root | null = null;
let widgetContainer: HTMLElement | null = null;
let isInitialized = false;

// ✅ MAIN INITIALIZATION FUNCTION with validation
export async function initComviaWidget(config: WidgetConfig = {}) {
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

  // ✅ CRITICAL: Validate company ID BEFORE rendering
  const companyId = mergedConfig.companyId;
  const apiUrl = mergedConfig.apiUrl;

  if (!companyId) {
    showErrorWidget(
      'Company ID is missing. Please provide a valid company ID in the widget configuration.',
      mergedConfig
    );
    isInitializing = false;
    return null;
  }

  // ✅ Validate company ID against API
  console.log('🔍 [WIDGET] Validating company ID:', companyId);
  
  try {
    const validation = await validateCompanyId(companyId, apiUrl);
    
    if (!validation.valid) {
      showErrorWidget(
        validation.error || 'Invalid company configuration. Please check your company ID.',
        mergedConfig
      );
      isInitializing = false;
      return null;
    }

    // ✅ Merge company settings with config
    if (validation.data) {
      const data = validation.data;
      
      mergedConfig.companyName = mergedConfig.companyName || data.companyName;
      mergedConfig.companyLogo = mergedConfig.companyLogo || data.companyLogo;
      mergedConfig.position = mergedConfig.position || data.widgetSettings?.position;
      mergedConfig.color = mergedConfig.color || data.widgetSettings?.color;
      mergedConfig.icon = mergedConfig.icon || data.widgetSettings?.icon;
      mergedConfig.font = mergedConfig.font || data.widgetSettings?.font;
      mergedConfig.welcomeMessage = mergedConfig.welcomeMessage || data.widgetSettings?.welcomeMessage;
      
      if (!mergedConfig.quickReplies || mergedConfig.quickReplies.length === 0) {
        mergedConfig.quickReplies = data.widgetSettings?.quickReplies || [];
      }
    }

    console.log('✅ [WIDGET] Company validation passed!');
    console.log('💬 [WIDGET] Final config:', {
      ...mergedConfig,
      visitorId: mergedConfig.visitorId,
    });

  } catch (error: any) {
    showErrorWidget(
      error.message || 'Failed to validate company configuration.',
      mergedConfig
    );
    isInitializing = false;
    return null;
  }

  // ✅ Store config globally
  (window as any).comviaSettings = mergedConfig;

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
  console.log('💬 Comvia Widget initialized successfully with visitor ID:', mergedConfig.visitorId);
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
  
  // Clear error state
  const errorWidget = document.getElementById('comvia-error-widget');
  if (errorWidget) {
    errorWidget.remove();
  }
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

  // Check for existing visitor ID in localStorage
  const existingVisitorId = localStorage.getItem('comvia_visitor_id');
  if (existingVisitorId) {
    config.visitorId = existingVisitorId;
  }

  // ✅ Only auto-init if companyId is present
  const shouldAutoInit = config.companyId && (config.position || config.color || config.companyName);
  
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
  } else if (config.companyId) {
    console.log('⏳ [WIDGET] Waiting for full widget configuration...');
  } else {
    console.log('ℹ️ [WIDGET] Auto-initialization skipped - no company ID provided');
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