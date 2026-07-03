// components/LandingPage/Features.tsx
"use client";

import { 
  MessageSquare, 
  Bot, 
  Palette, 
  BarChart3, 
  Shield, 
  Zap,
  Sparkles 
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Real-time Chat",
    description:
      "Engage with visitors instantly through a sleek, customizable chat widget that matches your brand.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Bot,
    title: "AI Assistance",
    description:
      "Intelligent AI-powered responses that help your team handle customer queries faster and more efficiently.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Palette,
    title: "Customizable Widget",
    description:
      "Full control over the look and feel of your support widget with easy-to-use customization options.",
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track performance metrics, customer satisfaction scores, and team productivity in one place.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description:
      "Enterprise-grade security with end-to-end encryption and 99.9% uptime SLA.",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Optimized for performance with instant message delivery and minimal latency.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4" />
            Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Everything you need for
            <br />
            <span className="gradient-text">modern support</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Powerful features designed to help you connect with your customers
            and provide exceptional support experiences.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-background border border-gray-200/50 dark:border-gray-800/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}