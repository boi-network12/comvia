// app/page.tsx
"use client";

import CTASection from "@/components/LandingPage/CTASection";
import Features from "@/components/LandingPage/Features";
import Footer from "@/components/LandingPage/Footer";
import Header from "@/components/LandingPage/Header";
import Hero from "@/components/LandingPage/Hero";
import Testimonials from "@/components/LandingPage/Testimonials";
import Stats from "@/components/LandingPage/Stats";
import TrustedBy from "@/components/LandingPage/TrustedBy";
import HowItWorks from "@/components/LandingPage/HowItWorks";
import WhyComvia from "@/components/LandingPage/WhyComvia";
import FAQ from "@/components/LandingPage/FAQ";
import FeaturesDetailed from "@/components/LandingPage/FeaturesDetailed";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Load the widget script on the landing page
    const loadWidget = () => {
      // Don't load if already loaded
      if (document.querySelector('script[src*="comvia-widget"]')) return;

      const settings = {
        position: "bottom-right",
        color: "#F97316",
        icon: "chat",
        companyName: "Comvia support",
        companyLogo: "https://res.cloudinary.com/dypgxulgp/image/upload/v1783365898/company-logos/rxpufzatykimmoka45wi.png"
      };

      const script = document.createElement('script');
      script.src = 'https://comvia-widget.vercel.app/comvia-widget.min.js';
      script.setAttribute('data-settings', encodeURIComponent(JSON.stringify(settings)));
      document.head.appendChild(script);
    };

    // Load widget after component mounts
    loadWidget();

    // Cleanup when component unmounts
    return () => {
      const widgetScript = document.querySelector('script[src*="comvia-widget"]');
      if (widgetScript) {
        widgetScript.remove();
      }
      // Also remove widget container if exists
      const widgetContainer = document.getElementById('comvia-widget-root');
      if (widgetContainer) {
        widgetContainer.remove();
      }
    };
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <TrustedBy />
        <FeaturesDetailed /> 
        <HowItWorks />
        <WhyComvia />
        <Stats />
        <Testimonials />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}