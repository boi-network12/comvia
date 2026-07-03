// components/LandingPage/HowItWorks.tsx
"use client";

import { MessageSquare, Settings, Zap, Sparkles, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: MessageSquare,
    title: "Install the Widget",
    description: "Add a single line of code to your website and the chat widget appears instantly. No complex setup required.",
    step: "01",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Settings,
    title: "Customize Your Brand",
    description: "Match the widget to your brand with our intuitive customization tools. Colors, fonts, and positioning in seconds.",
    step: "02",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Zap,
    title: "Start Engaging",
    description: "Connect with visitors in real-time, use AI-powered responses, and watch your satisfaction rates soar.",
    step: "03",
    color: "from-orange-500 to-red-500",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4" />
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Get started in
            <br />
            <span className="gradient-text">three simple steps</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            From installation to engagement, Comvia makes it effortless to connect with your customers.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
          
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                <div className="relative bg-background rounded-2xl p-8 border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  {/* Step Number */}
                  <div className="absolute -top-4 -right-4 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-primary/25">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center mb-4 shadow-lg transition-transform group-hover:scale-110`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Decorative Arrow */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-gray-700">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button className="group px-8 py-4 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium inline-flex items-center gap-2">
            Start Your Free Trial
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}