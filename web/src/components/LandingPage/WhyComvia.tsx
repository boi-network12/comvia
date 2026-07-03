// components/LandingPage/WhyComvia.tsx
"use client";

import { 
  Sparkles, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  Code, 
  Globe, 
  Clock,
  CheckCircle2
} from "lucide-react";

const reasons = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Messages deliver instantly with sub-100ms latency, ensuring real-time conversations.",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption, SOC 2 compliance, and 99.9% uptime SLA.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description: "Built-in team inbox, assignments, and internal notes for seamless support.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: BarChart3,
    title: "Actionable Insights",
    description: "Real-time analytics, sentiment analysis, and customer behavior tracking.",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    icon: Code,
    title: "Developer Friendly",
    description: "RESTful API, webhooks, and SDKs for custom integrations.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Globe,
    title: "Global Scale",
    description: "Multi-language support and CDN-backed delivery worldwide.",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
];

const benefits = [
  "Customizable to match your brand perfectly",
  "AI-powered responses reduce response time by 60%",
  "No coding skills required for setup",
  "24/7 customer support included",
  "GDPR and CCPA compliant",
  "Free 14-day trial, no credit card needed",
];

export default function WhyComvia() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 mb-4">
            <Sparkles className="w-4 h-4" />
            Why Comvia
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Built for teams that
            <br />
            <span className="gradient-text">care about support</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to deliver exceptional customer experiences, all in one platform.
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {reasons.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={index}
                className="group p-8 rounded-2xl bg-background border border-gray-200/50 dark:border-gray-800/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${reason.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                  <Icon className={`w-6 h-6 ${reason.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{reason.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {reason.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Benefits List */}
        <div className="bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl p-8 sm:p-12 border border-gray-200/50 dark:border-gray-800/50">
          <h3 className="text-2xl font-bold mb-6 text-center">
            What you get with Comvia
          </h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5 transition-transform group-hover:scale-110" />
                <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}