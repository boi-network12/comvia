// components/LandingPage/FeaturesDetailed.tsx
"use client";

import { 
  MessageSquare, 
  Bot, 
  Palette, 
  BarChart3, 
  Shield, 
  Zap,
  Sparkles,
  Users,
  Clock,
  Globe,
  Code,
  Smartphone,
  Headphones,
  Lock,
  Award,
  TrendingUp,
  CheckCircle
} from "lucide-react";

const featureCategories = [
  {
    title: "Core Features",
    features: [
      {
        icon: MessageSquare,
        title: "Real-time Live Chat",
        description: "Instant messaging with typing indicators, file sharing, and read receipts.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        icon: Bot,
        title: "AI-Powered Assistant",
        description: "Smart responses, automated workflows, and intelligent routing.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
      {
        icon: Palette,
        title: "Customizable Widget",
        description: "Full control over appearance with no-code customization.",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
      },
      {
        icon: BarChart3,
        title: "Advanced Analytics",
        description: "Track satisfaction, response times, and team performance.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
    ],
  },
  {
    title: "Advanced Features",
    features: [
      {
        icon: Users,
        title: "Team Collaboration",
        description: "Shared inbox, assignments, and internal notes for team efficiency.",
        color: "text-indigo-500",
        bg: "bg-indigo-500/10",
      },
      {
        icon: Clock,
        title: "Automated Triggers",
        description: "Proactive chat triggers based on visitor behavior and time.",
        color: "text-orange-500",
        bg: "bg-orange-500/10",
      },
      {
        icon: Globe,
        title: "Multi-language Support",
        description: "Reach global audiences with automatic language detection.",
        color: "text-cyan-500",
        bg: "bg-cyan-500/10",
      },
      {
        icon: Code,
        title: "Developer API",
        description: "Full REST API, webhooks, and SDKs for custom integrations.",
        color: "text-gray-500",
        bg: "bg-gray-500/10",
      },
    ],
  },
  {
    title: "Security & Support",
    features: [
      {
        icon: Shield,
        title: "Enterprise Security",
        description: "End-to-end encryption, SSO, and SOC 2 compliance.",
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
      },
      {
        icon: Smartphone,
        title: "Mobile Apps",
        description: "Native iOS and Android apps for support on the go.",
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
      {
        icon: Headphones,
        title: "24/7 Support",
        description: "Round-the-clock assistance with guaranteed response times.",
        color: "text-purple-500",
        bg: "bg-purple-500/10",
      },
      {
        icon: Lock,
        title: "GDPR & CCPA Compliant",
        description: "Full compliance with global data protection regulations.",
        color: "text-pink-500",
        bg: "bg-pink-500/10",
      },
    ],
  },
];

const featuresList = [
  "AI-powered automated responses",
  "Customizable chat triggers",
  "Real-time visitor tracking",
  "File sharing and attachments",
  "Canned responses and shortcuts",
  "Customer satisfaction surveys",
  "Team performance analytics",
  "Automated ticket routing",
  "Multi-channel support",
  "Custom reporting dashboards",
];

export default function FeaturesDetailed() {
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
            <span className="gradient-text">exceptional support</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Comprehensive features designed to help you deliver world-class customer experiences.
          </p>
        </div>

        {/* Feature Categories */}
        {featureCategories.map((category, catIndex) => (
          <div key={catIndex} className="mb-16 last:mb-0">
            <h3 className="text-2xl font-bold mb-8 text-center gradient-text">
              {category.title}
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group p-6 rounded-2xl bg-background border border-gray-200/50 dark:border-gray-800/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1"
                  >
                    <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                      <Icon className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <h4 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {feature.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Comprehensive Features List */}
        <div className="mt-16 bg-gray-50/50 dark:bg-gray-900/20 rounded-3xl p-8 sm:p-12 border border-gray-200/50 dark:border-gray-800/50">
          <h3 className="text-2xl font-bold mb-8 text-center">
            All features at a glance
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl mx-auto">
            {featuresList.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 group">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 transition-transform group-hover:scale-110" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}