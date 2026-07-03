// components/LandingPage/Testimonials.tsx
"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "CEO, TechFlow",
    content:
      "Comvia has completely transformed how we handle customer support. The AI assistant alone saves us 20+ hours per week, allowing our team to focus on what matters most.",
    avatar: "SJ",
    rating: 5,
  },
  {
    name: "Mike Chen",
    role: "Support Lead, CloudSync",
    content:
      "The customizable widget is a game-changer. We matched it perfectly with our brand in under 5 minutes. Our support team has never been more efficient.",
    avatar: "MC",
    rating: 5,
  },
  {
    name: "Emily Rodriguez",
    role: "Product Manager, DataHub",
    content:
      "Real-time chat with AI-powered responses has increased our customer satisfaction scores by 40%. It's the best investment we've made in customer experience.",
    avatar: "ER",
    rating: 5,
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-semibold text-sm tracking-wider uppercase">
            Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mt-2 mb-4">
            Loved by teams
            <br />
            <span className="gradient-text ">everywhere</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            See what our customers have to say about their experience with Comvia.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-background border border-gray-200/50 dark:border-gray-800/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10" />
              
              <div className="flex items-center gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full gradient-primary flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-primary/20">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{testimonial.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}