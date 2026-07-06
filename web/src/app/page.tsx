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
import WidgetLoader from "@/components/static/WidgetLoader";

export default function Home() {
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

      <WidgetLoader 
        position="bottom-right"
        color="#F97316"
        icon="chat"
        companyName="Comvia support"
        companyLogo="https://res.cloudinary.com/dypgxulgp/image/upload/v1783365898/company-logos/rxpufzatykimmoka45wi.png"
      />
    </>
  );
}

// landing page