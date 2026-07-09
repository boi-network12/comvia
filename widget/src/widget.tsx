// // widget/src/widget.tsx
// import "./polyfills";

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import './index.css';

// // Widget configuration interface
// export interface WidgetConfig {
//   position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
//   color?: string;
//   icon?: string;
//   companyName?: string;
//   companyLogo?: string;
//   apiUrl?: string;
//   socketUrl?: string;
//   welcomeMessage?: string;
//   quickReplies?: string[];
//   font?: string;
//   companyId?: string;
//   visitorId?: string;
// }

// // ============================================================
// // TYPES
// // ============================================================

// interface ValidationResult {
//   valid: boolean;
//   error?: string;
//   companyData?: {
//     companyName: string;
//     companyLogo?: string;
//     widgetSettings: {
//       position: string;
//       color: string;
//       icon: string;
//       font: string;
//       welcomeMessage: string;
//       quickReplies: string[];
//     };
//   };
// }

// // ============================================================
// // HELPER: Get or create persistent visitor ID
// // ============================================================

// const getOrCreateVisitorId = (): string => {
//   let visitorId = localStorage.getItem('comvia_visitor_id');
//   if (!visitorId) {
//     visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//     localStorage.setItem('comvia_visitor_id', visitorId);
//     console.log('🆕 [WIDGET] Created new visitor ID:', visitorId);
//   } else {
//     console.log('♻️ [WIDGET] Using existing visitor ID:', visitorId);
//   }
//   return visitorId;
// };

// // ============================================================
// // HELPER: Validate company ID and fetch settings
// // ============================================================

// async function validateCompanyId(companyId: string, apiUrl: string): Promise<ValidationResult> {
//   if (!companyId || companyId.trim() === '') {
//     return {
//       valid: false,
//       error: 'Company ID is required. Please provide a valid company ID.'
//     };
//   }

//   try {
//     // ✅ Try to fetch company settings using the companyId
//     const response = await fetch(`${apiUrl}/company/${companyId}/widget`, {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });

//     if (!response.ok) {
//       // Check if it's a 404 (company not found)
//       if (response.status === 404) {
//         return {
//           valid: false,
//           error: `Company with ID "${companyId}" not found. Please check your company ID and try again.`
//         };
//       }
      
//       // Other error
//       const errorData = await response.json().catch(() => ({}));
//       return {
//         valid: false,
//         error: errorData.message || `Failed to validate company (status: ${response.status}). Please check your configuration.`
//       };
//     }

//     const result = await response.json();
    
//     if (!result.success || !result.data) {
//       return {
//         valid: false,
//         error: 'Invalid response from server. Please contact support.'
//       };
//     }

//     // ✅ Company is valid, return settings
//     return {
//       valid: true,
//       companyData: {
//         companyName: result.data.companyName || 'Comvia',
//         companyLogo: result.data.companyLogo || '',
//         widgetSettings: {
//           position: result.data.widgetSettings?.position || 'bottom-right',
//           color: result.data.widgetSettings?.color || '#F97316',
//           icon: result.data.widgetSettings?.icon || 'chat',
//           font: result.data.widgetSettings?.font || 'inter',
//           welcomeMessage: result.data.widgetSettings?.welcomeMessage || 'Hi there! 👋 How can I help you today?',
//           quickReplies: result.data.widgetSettings?.quickReplies || ['Pricing', 'Features', 'Support', 'Demo'],
//         }
//       }
//     };
//   } catch (error: any) {
//     console.error('❌ [WIDGET] Company validation error:', error);
    
//     // Check if it's a network error
//     if (error.message?.includes('fetch') || error.message?.includes('network')) {
//       return {
//         valid: false,
//         error: 'Network error. Please check your internet connection and try again.'
//       };
//     }
    
//     return {
//       valid: false,
//       error: error.message || 'Failed to validate company. Please contact support.'
//     };
//   }
// }

// // ============================================================
// // HELPER: Show error message in widget
// // ============================================================

// function showErrorWidget(errorMessage: string, config: WidgetConfig): void {
//   // Remove existing widget if any
//   const existingContainer = document.getElementById('comvia-widget-root');
//   if (existingContainer) {
//     existingContainer.remove();
//   }

//   // Create container
//   const container = document.createElement('div');
//   container.id = 'comvia-widget-root';
//   document.body.appendChild(container);

//   // Create error UI
//   const errorHtml = `
//     <div id="comvia-error-widget" style="
//       position: fixed;
//       bottom: 24px;
//       right: 24px;
//       z-index: 9999;
//       max-width: 380px;
//       background: white;
//       border-radius: 16px;
//       padding: 20px 24px;
//       box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
//       border: 1px solid #fee2e2;
//       font-family: ${config.font === 'inter' ? 'Inter, system-ui, sans-serif' : 'system-ui, sans-serif'};
//     ">
//       <div style="display: flex; align-items: flex-start; gap: 12px;">
//         <div style="
//           flex-shrink: 0;
//           width: 40px;
//           height: 40px;
//           background: #fee2e2;
//           border-radius: 50%;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 20px;
//         ">
//           ❌
//         </div>
//         <div style="flex: 1; min-width: 0;">
//           <h4 style="
//             margin: 0 0 4px 0;
//             font-size: 15px;
//             font-weight: 600;
//             color: #dc2626;
//           ">
//             Widget Error
//           </h4>
//           <p style="
//             margin: 0;
//             font-size: 13px;
//             color: #6b7280;
//             line-height: 1.5;
//           ">
//             ${errorMessage}
//           </p>
//           <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
//             margin-top: 12px;
//             padding: 6px 16px;
//             background: #f3f4f6;
//             border: none;
//             border-radius: 8px;
//             font-size: 12px;
//             font-weight: 500;
//             color: #374151;
//             cursor: pointer;
//           ">
//             Dismiss
//           </button>
//         </div>
//       </div>
//     </div>
//   `;

//   container.innerHTML = errorHtml;

//   // Also store error state globally for debugging
//   (window as any).__comviaWidgetError = {
//     hasError: true,
//     message: errorMessage,
//     timestamp: new Date().toISOString()
//   };

//   console.error('❌ [WIDGET] Widget initialization failed:', errorMessage);
// }

// // ============================================================
// // MAIN INITIALIZATION FUNCTION
// // ============================================================

// let isInitializing = false;
// let widgetInstance: ReactDOM.Root | null = null;
// let widgetContainer: HTMLElement | null = null;
// let isInitialized = false;

// export async function initComviaWidget(config: WidgetConfig = {}) {
//   if (isInitializing) {
//     console.log('⏳ Widget initialization already in progress...');
//     return widgetContainer;
//   }

//   if (isInitialized) {
//     console.log('💬 Widget already initialized');
//     return widgetContainer;
//   }

//   isInitializing = true;

//   // Merge with existing config
//   const existingConfig = (window as any).comviaSettings || {};

//   // Check for data-settings attribute on script tag
//   const scripts = document.querySelectorAll('script');
//   let settingsAttr = null;
//   for (const script of scripts) {
//     const attr = script.getAttribute('data-settings');
//     if (attr) {
//       settingsAttr = attr;
//       break;
//     }
//   }

//   let parsedSettings = {};
//   if (settingsAttr) {
//     try {
//       parsedSettings = JSON.parse(decodeURIComponent(settingsAttr));
//       console.log('📦 [WIDGET] Parsed settings from data-settings:', parsedSettings);
//     } catch (e) {
//       console.warn('⚠️ [WIDGET] Failed to parse data-settings:', e);
//     }
//   }

//   const mergedConfig = { ...parsedSettings, ...existingConfig, ...config };

//   // ✅ ENSURE visitorId is set
//   if (!mergedConfig.visitorId) {
//     mergedConfig.visitorId = getOrCreateVisitorId();
//   }

//   // Ensure apiUrl is set correctly
//   if (!mergedConfig.apiUrl) {
//     mergedConfig.apiUrl = import.meta.env.VITE_API_URL || 'https://comvia-backend-endpoint.vercel.app/api';
//   }

//   // ✅ CRITICAL: Validate company ID
//   const companyId = mergedConfig.companyId;
//   const apiUrl = mergedConfig.apiUrl;

//   if (!companyId) {
//     showErrorWidget(
//       'Company ID is missing. Please provide a valid company ID in the widget configuration.',
//       mergedConfig
//     );
//     isInitializing = false;
//     return null;
//   }

//   // ✅ Validate company ID against API
//   console.log('🔍 [WIDGET] Validating company ID:', companyId);
  
//   try {
//     const validation = await validateCompanyId(companyId, apiUrl);
    
//     if (!validation.valid) {
//       showErrorWidget(
//         validation.error || 'Invalid company configuration. Please check your company ID.',
//         mergedConfig
//       );
//       isInitializing = false;
//       return null;
//     }

//     // ✅ Merge company settings with config
//     if (validation.companyData) {
//       const { companyName, companyLogo, widgetSettings } = validation.companyData;
      
//       mergedConfig.companyName = mergedConfig.companyName || companyName;
//       mergedConfig.companyLogo = mergedConfig.companyLogo || companyLogo;
//       mergedConfig.position = mergedConfig.position || widgetSettings.position;
//       mergedConfig.color = mergedConfig.color || widgetSettings.color;
//       mergedConfig.icon = mergedConfig.icon || widgetSettings.icon;
//       mergedConfig.font = mergedConfig.font || widgetSettings.font;
//       mergedConfig.welcomeMessage = mergedConfig.welcomeMessage || widgetSettings.welcomeMessage;
      
//       // Merge quick replies (config overrides API)
//       if (mergedConfig.quickReplies && mergedConfig.quickReplies.length > 0) {
//         // Keep config quick replies if provided
//       } else {
//         mergedConfig.quickReplies = widgetSettings.quickReplies;
//       }
//     }

//     console.log('✅ [WIDGET] Company validation passed!');
//     console.log('💬 [WIDGET] Final config:', {
//       ...mergedConfig,
//       visitorId: mergedConfig.visitorId,
//     });

//   } catch (error: any) {
//     showErrorWidget(
//       error.message || 'Failed to validate company configuration.',
//       mergedConfig
//     );
//     isInitializing = false;
//     return null;
//   }

//   // ✅ Store config globally
//   (window as any).comviaSettings = mergedConfig;

//   // Remove existing widget if any
//   destroyWidget();

//   // Create container
//   widgetContainer = document.createElement('div');
//   widgetContainer.id = 'comvia-widget-root';
//   document.body.appendChild(widgetContainer);

//   // Render widget
//   widgetInstance = ReactDOM.createRoot(widgetContainer);
//   widgetInstance.render(
//     <React.StrictMode>
//       <App />
//     </React.StrictMode>
//   );

//   isInitialized = true;
//   console.log('💬 Comvia Widget initialized successfully with visitor ID:', mergedConfig.visitorId);
//   return widgetContainer;
// }

// // ============================================================
// // DESTROY WIDGET
// // ============================================================

// export function destroyWidget() {
//   if (widgetInstance) {
//     widgetInstance.unmount();
//     widgetInstance = null;
//   }
//   if (widgetContainer && widgetContainer.parentNode) {
//     widgetContainer.parentNode.removeChild(widgetContainer);
//     widgetContainer = null;
//   }
//   isInitialized = false;
  
//   // Clear error state
//   const errorWidget = document.getElementById('comvia-error-widget');
//   if (errorWidget) {
//     errorWidget.remove();
//   }
// }

// // ============================================================
// // AUTO-INITIALIZATION
// // ============================================================

// (function autoInit() {
//   const config = (window as any).comviaSettings || {};

//   // Check for data-settings attribute
//   const scripts = document.querySelectorAll('script');
//   let settingsAttr = null;
//   for (const script of scripts) {
//     const attr = script.getAttribute('data-settings');
//     if (attr) {
//       settingsAttr = attr;
//       break;
//     }
//   }
  
//   if (settingsAttr) {
//     try {
//       const parsed = JSON.parse(decodeURIComponent(settingsAttr));
//       Object.assign(config, parsed);
//     } catch (e) {
//       console.warn('⚠️ Failed to parse data-settings:', e);
//     }
//   }

//   // Check for existing visitor ID in localStorage
//   const existingVisitorId = localStorage.getItem('comvia_visitor_id');
//   if (existingVisitorId) {
//     config.visitorId = existingVisitorId;
//     console.log('♻️ [WIDGET] Restored visitor ID from localStorage:', existingVisitorId);
//   }

//   // ✅ Only auto-init if companyId is present
//   const shouldAutoInit = config.companyId && (config.position || config.color || config.companyName);
  
//   if (shouldAutoInit) {
//     const initFn = () => {
//       setTimeout(() => {
//         initComviaWidget(config);
//       }, 10);
//     };

//     if (document.readyState === 'loading') {
//       document.addEventListener('DOMContentLoaded', initFn);
//     } else if (document.readyState === 'complete') {
//       initFn();
//     } else {
//       if (document.body) {
//         initFn();
//       } else {
//         document.addEventListener('DOMContentLoaded', initFn);
//       }
//     }
//   } else if (config.companyId) {
//     // Company ID is present but no other settings - wait for full config
//     console.log('⏳ [WIDGET] Waiting for full widget configuration...');
//   } else {
//     console.log('ℹ️ [WIDGET] Auto-initialization skipped - no company ID provided');
//   }
// })();

// // ============================================================
// // EXPOSE TO WINDOW
// // ============================================================

// (window as any).ComviaWidget = {
//   init: initComviaWidget,
//   destroy: destroyWidget,
//   version: '1.0.0',
// };

// (window as any).initComviaWidget = initComviaWidget;
// (window as any).destroyWidget = destroyWidget;

// export default { 
//   init: initComviaWidget, 
//   destroy: destroyWidget,
//   version: '1.0.0',
// };
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
    // console.log('🆕 [WIDGET] Created new visitor ID:', visitorId);
  } else {
    // console.log('♻️ [WIDGET] Using existing visitor ID:', visitorId);
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
    // console.log('⏳ Widget initialization already in progress...');
    return widgetContainer;
  }

  if (isInitialized) {
    // console.log('💬 Widget already initialized');
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
      // console.log('📦 [WIDGET] Parsed settings from data-settings:', parsedSettings);
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

  // console.log('💬 [WIDGET] Final config:', {
  //   ...mergedConfig,
  //   visitorId: mergedConfig.visitorId, // ← Log the visitor ID
  // });

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
  // console.log('💬 Comvia Widget initialized with visitor ID:', mergedConfig.visitorId);
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
    // console.log('♻️ [WIDGET] Restored visitor ID from localStorage:', existingVisitorId);
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



// i want her in widget if copany Id is invalid to not display and show error message (e no work so i commented it)