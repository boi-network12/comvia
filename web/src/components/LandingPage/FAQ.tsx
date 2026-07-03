// components/LandingPage/FAQ.tsx
"use client";

import { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How long does it take to set up Comvia?",
    answer: "You can have Comvia up and running in less than 5 minutes. Simply add our lightweight script to your website, customize the widget to match your brand, and you're ready to start engaging with visitors.",
  },
  {
    question: "Is Comvia suitable for small businesses?",
    answer: "Absolutely! Comvia scales from startups to enterprises. Our pricing plans are designed to grow with your business, and we offer a free 14-day trial so you can test everything before committing.",
  },
  {
    question: "What kind of support does Comvia offer?",
    answer: "We provide 24/7 email support, live chat during business hours, comprehensive documentation, video tutorials, and a dedicated success manager for enterprise plans.",
  },
  {
    question: "Can I customize the chat widget to match my brand?",
    answer: "Yes! Comvia offers extensive customization options including colors, fonts, positioning, chat triggers, and even custom CSS for complete control over the look and feel.",
  },
  {
    question: "Is my data secure with Comvia?",
    answer: "Comvia is SOC 2 compliant, uses end-to-end encryption, and follows GDPR and CCPA guidelines. We also offer SSO and advanced security features for enterprise customers.",
  },
  {
    question: "What happens if I exceed my plan limits?",
    answer: "We'll notify you before you exceed your limits and provide options to upgrade your plan or add additional capacity. We never cut off your service unexpectedly.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium border border-primary/20 mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Questions? We&apos;ve
            <br />
            <span className="gradient-text">got answers</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Everything you need to know about Comvia. Can&apos;t find what you&apos;re looking for?
            <button className="text-primary hover:underline font-medium ml-1">
              Contact support
            </button>
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border border-gray-200/50 dark:border-gray-800/50 bg-background transition-all ${
                  isOpen ? "shadow-lg shadow-primary/5" : "hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left group"
                >
                  <span className="text-base font-semibold group-hover:text-primary transition-colors">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 mt-1">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-primary" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    )}
                  </span>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Still have questions?
          </p>
          <button className="px-8 py-3.5 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-105 font-medium">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}