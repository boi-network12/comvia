// components/WidgetLoader.tsx
"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

interface WidgetLoaderProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
  icon?: string;
  companyName?: string;
  companyLogo?: string;
  companyId?: string;
}

export default function WidgetLoader({ 
  position = "bottom-right",
  color = "#F97316",
  icon = "chat",
  companyName = "Comvia support",
  companyLogo = "https://res.cloudinary.com/dypgxulgp/image/upload/v1783365898/company-logos/rxpufzatykimmoka45wi.png",
  companyId,
}: WidgetLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if widget is already loaded
    if (document.querySelector('script[src*="comvia-widget"]')) {
        // eslint-disable-next-line
      setIsLoaded(true);
    }
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    console.log('💬 Comvia Widget loaded');
  };

  // If already loaded, we don't need to load again
  if (isLoaded) return null;

  return (
    <Script
      src="https://comvia-widget.vercel.app/comvia-widget.min.js"
      strategy="afterInteractive"
      data-position={position}
      data-color={color}
      data-icon={icon}
      data-company-name={companyName}
      data-company-logo={companyLogo}
      data-company-id={companyId}
      onLoad={handleLoad}
    />
  );
}