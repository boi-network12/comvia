// components/LandingPage/CTASection.tsx
"use client";

import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent dark:from-primary/10 dark:via-primary/5 p-12 sm:p-16 border border-gray-200/50 dark:border-gray-800/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-primary/5 to-transparent blur-2xl" />
          
          <div className="relative text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-background/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4 text-primary" />
              Start your free trial today
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Ready to transform your
              <br />
              <span className="gradient-text ">customer support?</span>
            </h2>
            
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Join thousands of companies already using Comvia to deliver
              exceptional customer experiences.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button className="group px-8 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all font-medium">
                Contact Sales
              </button>
            </div>
            
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}