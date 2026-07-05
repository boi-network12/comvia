// components/LandingPage/HowItWorks.tsx
"use client";

import { MessageSquare, Settings, Zap, Sparkles, ArrowRight, Check, MoveRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const steps = [
  {
    icon: MessageSquare,
    title: "Install the Widget",
    description: "Add a single line of code to your website and the chat widget appears instantly. No complex setup required.",
    step: "01",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    features: ["One-line installation", "Instant deployment", "Zero configuration"],
  },
  {
    icon: Settings,
    title: "Customize Your Brand",
    description: "Match the widget to your brand with our intuitive customization tools. Colors, fonts, and positioning in seconds.",
    step: "02",
    color: "from-purple-500 to-pink-500",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
    features: ["No-code customization", "Live preview", "Brand consistency"],
  },
  {
    icon: Zap,
    title: "Start Engaging",
    description: "Connect with visitors in real-time, use AI-powered responses, and watch your satisfaction rates soar.",
    step: "03",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    features: ["Real-time chat", "AI assistance", "Analytics dashboard"],
  },
];

export default function HowItWorks() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 sm:py-20 md:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorations - Adjusted for mobile */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-[300px] sm:w-[400px] md:w-[500px] h-[300px] sm:h-[400px] md:h-[500px] bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[250px] sm:w-[350px] md:w-[400px] h-[250px] sm:h-[350px] md:h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] md:w-[600px] h-[300px] sm:h-[400px] md:h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header - Mobile optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium border border-primary/20 mb-3 sm:mb-4 backdrop-blur-sm">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            Simple Setup Process
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-3 sm:mb-4">
            Get started in
            <br />
            <span className="gradient-text">three simple steps</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            From installation to engagement, Comvia makes it effortless to connect with your customers in minutes.
          </p>
        </motion.div>

        {/* Steps - Mobile optimized grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-8 relative">
          {/* Connecting Line - Hidden on mobile */}
          <div className="hidden md:block absolute top-1/2 left-[16%] right-[16%] h-[2px] -translate-y-1/2">
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary via-primary/60 to-transparent"
                initial={{ width: "0%" }}
                whileInView={{ width: "100%" }}
                transition={{ duration: 2, delay: 0.5 }}
                viewport={{ once: true }}
              />
            </div>
          </div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                viewport={{ once: true }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="relative"
              >
                <div className={`
                  relative bg-background rounded-2xl sm:rounded-3xl p-6 sm:p-8 
                  border-2 transition-all duration-500
                  ${isHovered ? 'border-primary/40 shadow-2xl shadow-primary/10 -translate-y-2' : 'border-gray-200/50 dark:border-gray-800/50 shadow-lg'}
                  hover:shadow-2xl hover:-translate-y-2
                `}>
                  {/* Glow Effect on Hover */}
                  {isHovered && (
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl sm:rounded-3xl blur-xl -z-10" />
                  )}

                  {/* Step Number - Floating Badge (responsive sizing) */}
                  <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4">
                    <div className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl 
                      flex items-center justify-center 
                      bg-gradient-to-r ${step.color} text-white font-bold text-xs sm:text-sm
                      shadow-lg shadow-primary/25 transition-transform duration-300
                      ${isHovered ? 'scale-110 rotate-3' : ''}
                    `}>
                      <span className="relative">
                        {step.step}
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white/30 rounded-full animate-pulse" />
                      </span>
                    </div>
                  </div>

                  {/* Icon - Responsive sizing */}
                  <div className="relative mb-4 sm:mb-5">
                    <div className={`
                      w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl 
                      bg-gradient-to-r ${step.color} 
                      flex items-center justify-center shadow-lg
                      transition-all duration-500
                      ${isHovered ? 'scale-110 rotate-6 shadow-xl' : ''}
                    `}>
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    {isHovered && (
                      <motion.div
                        className="absolute -inset-1 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary/20 to-transparent"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                    {step.description}
                  </p>

                  {/* Feature List - Responsive spacing */}
                  <ul className="space-y-1.5 sm:space-y-2">
                    {step.features.map((feature, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400"
                      >
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center flex-shrink-0`}>
                          <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />
                        </div>
                        {feature}
                      </motion.li>
                    ))}
                  </ul>

                  {/* Progress Indicator - Hidden on mobile */}
                  <div className="hidden sm:block mt-4 pt-4 border-t border-gray-200/50 dark:border-gray-800/50">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div 
                          className={`h-full bg-gradient-to-r ${step.color}`}
                          initial={{ width: "0%" }}
                          whileInView={{ width: "100%" }}
                          transition={{ duration: 1, delay: index * 0.2 + 0.5 }}
                          viewport={{ once: true }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-400">
                        Step {index + 1}/3
                      </span>
                    </div>
                  </div>

                  {/* Mobile Step Indicator */}
                  <div className="sm:hidden mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-400">
                      Step {index + 1} of 3
                    </span>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((dot) => (
                        <div
                          key={dot}
                          className={`w-1.5 h-1.5 rounded-full transition-colors ${
                            dot === index ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Decorative Arrow - Mobile only */}
                  {index < steps.length - 1 && (
                    <div className="md:hidden flex justify-center -mb-2 mt-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <MoveRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA - Mobile optimized */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-12 sm:mt-16"
        >
          {/* Mobile friendly CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 bg-background/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-800/50 rounded-2xl p-4 sm:p-6 shadow-lg max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {["SJ", "MC", "ER"].map((initials, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-background flex items-center justify-center text-[10px] sm:text-xs font-medium text-white ${
                      i === 0 ? "bg-blue-500" :
                      i === 1 ? "bg-purple-500" :
                      "bg-emerald-500"
                    }`}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-semibold">Join 2,000+ companies</p>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Trusted by teams worldwide</p>
              </div>
            </div>
            
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
              <button className="w-full sm:w-auto group px-4 sm:px-6 py-2.5 sm:py-3 gradient-primary text-white rounded-xl hover:shadow-2xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium inline-flex items-center justify-center gap-2 text-sm sm:text-base">
                Start Free Trial
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center justify-center gap-1 flex-wrap px-2">
            <span>🚀</span>
            <span>No credit card required</span>
            <span className="hidden xs:inline">•</span>
            <span className="block xs:inline">Free 14-day trial</span>
            <span className="hidden xs:inline">•</span>
            <span className="block xs:inline">Cancel anytime</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}