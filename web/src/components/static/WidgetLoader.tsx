// components/WidgetLoader.tsx
"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

interface WidgetLoaderProps {
  companyId: string; // ✅ Only require companyId
}

export default function WidgetLoader({ companyId }: WidgetLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (document.querySelector('script[src*="comvia-widget"]')) {
      // eslint-disable-next-line
      setIsLoaded(true);
    }
  }, []);

  if (isLoaded) return null;

  return (
    <Script
      id="comvia-widget-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var settings = { companyId: "${companyId}" };
            var script = document.createElement('script');
            script.src = 'https://comvia-widget.vercel.app/comvia-widget.min.js';
            script.setAttribute('data-settings', encodeURIComponent(JSON.stringify(settings)));
            document.head.appendChild(script);
          })();
        `
      }}
      onLoad={() => setIsLoaded(true)}
    />
  );
}