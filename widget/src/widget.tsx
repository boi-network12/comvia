// widget/src/widget.tsx
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

// Global widget instance
let widgetInstance: ReactDOM.Root | null = null;
let widgetContainer: HTMLElement | null = null;
let isInitialized = false;

// Main initialization function
export function initComviaWidget(config: WidgetConfig = {}) {
  // Don't initialize twice
  if (isInitialized) {
    console.log('💬 Widget already initialized');
    return widgetContainer;
  }

  // Merge with existing config
  const existingConfig = (window as any).comviaSettings || {};
  const mergedConfig = { ...existingConfig, ...config };
  
  // Store config globally
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

// Auto-initialization - runs when script loads
(function autoInit() {
  // Check if window.comviaSettings exists
  const config = (window as any).comviaSettings || {};

  // Check for data attributes on script tag
  const scripts = document.querySelectorAll('script');
  let currentScript: HTMLScriptElement | null = null;
  
  // Find the script that loaded this widget
  for (const script of scripts) {
    if (script.src && script.src.includes('comvia-widget')) {
      currentScript = script;
      break;
    }
  }

  if (currentScript) {
    const dataConfig = (currentScript as HTMLElement).dataset;
    // Map data attributes to config
    const mappedConfig: Record<string, any> = {};
    Object.keys(dataConfig).forEach(key => {
      const value = dataConfig[key];
      if (key === 'position') mappedConfig.position = value;
      else if (key === 'color') mappedConfig.color = value;
      else if (key === 'icon') mappedConfig.icon = value;
      else if (key === 'companyName') mappedConfig.companyName = value;
      else if (key === 'companyLogo') mappedConfig.companyLogo = value;
      else if (key === 'apiUrl') mappedConfig.apiUrl = value;
      else if (key === 'socketUrl') mappedConfig.socketUrl = value;
      else if (key === 'welcomeMessage') mappedConfig.welcomeMessage = value;
      else if (key === 'font') mappedConfig.font = value;
      else if (key === 'companyId') mappedConfig.companyId = value;
      else if (key === 'quickReplies' && value) {
        try {
          mappedConfig.quickReplies = JSON.parse(value);
        } catch {
          mappedConfig.quickReplies = value.split(',').map(s => s.trim());
        }
      }
    });
    
    Object.assign(config, mappedConfig);
  }

  // Auto-init if config has position or color
  if (config.position || config.color || config.companyName) {
    // Wait for DOM
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initComviaWidget(config);
      });
    } else {
      initComviaWidget(config);
    }
  }
})();

// Expose to window for manual initialization
(window as any).ComviaWidget = {
  init: initComviaWidget,
  destroy: destroyWidget,
};

// Also export for module imports
export default { 
  init: initComviaWidget, 
  destroy: destroyWidget 
};