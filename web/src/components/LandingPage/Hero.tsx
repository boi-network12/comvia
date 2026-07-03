// components/LandingPage/Hero.tsx
"use client";

import { ArrowRight, Play, Star, MessageSquare, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-subtle opacity-30" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] gradient-glow opacity-20" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] gradient-glow opacity-10" />

      {/* Floating Elements */}
      <div className="absolute top-32 left-10 hidden xl:block animate-float">
        <div className="bg-background/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold">Live Chat</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">2 active conversations</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-32 right-10 hidden xl:block animate-float delay-300">
        <div className="bg-background/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm font-semibold">97%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Satisfaction rate</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Available for Beta
            </div>

            {/* Heading - Fixed gradient text */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
              Modern Customer
              <br />
              <span className="gradient-text">Support Platform</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-lg leading-relaxed">
              Connect with your visitors in real-time through live chat, 
              customizable widgets, and AI-powered assistance that scales 
              with your business.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4">
              <button className="group px-7 py-3.5 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium flex items-center gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button className="px-7 py-3.5 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all font-medium flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-8 pt-4">
              <div className="flex -space-x-2">
                {["SJ", "MC", "ER", "AK", "JL"].map((initials, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-sm font-medium text-primary"
                  >
                    {initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-background flex items-center justify-center text-sm font-medium text-gray-500">
                  +2K
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Trusted by 2,000+ companies
                </p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative animate-fade-in-up delay-300">
            <div className="relative bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/5 dark:to-primary/10 rounded-3xl p-6 border border-gray-200/50 dark:border-gray-800/50 shadow-2xl">
              <div className="aspect-[4/3] bg-gray-50 dark:bg-gray-900/50 rounded-2xl overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-primary/25">
                      <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">Live Chat Dashboard</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Connect with visitors</p>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-16 h-16 bg-primary/10 rounded-2xl" />
                <div className="absolute bottom-4 right-4 w-12 h-12 bg-primary/5 rounded-2xl" />
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -top-4 -right-4 bg-background border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <div>
                  <p className="text-sm font-semibold">2 active chats</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average response: 3s</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-background border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-xl backdrop-blur-sm">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-sm font-semibold">AI Assistant</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}