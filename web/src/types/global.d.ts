// types/global.d.ts
export {};

declare global {
  interface Window {
    ComviaWidget?: {
      default?: {
        init: (settings: WidgetSettings) => void;
        destroy: () => void;
      };
      init?: (settings: WidgetSettings) => void;
      destroy?: () => void;
    };
    initComviaWidget?: (settings: WidgetSettings) => void;
    destroyWidget?: () => void;
    comviaSettings?: WidgetSettings;
  }
}

interface WidgetSettings {
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  color?: string;
  icon?: string;
  companyName?: string;
  companyLogo?: string;
  apiUrl?: string;
  socketUrl?: string;
  companyId?: string;
  font?: string;
  welcomeMessage?: string;
  quickReplies?: string[];
}