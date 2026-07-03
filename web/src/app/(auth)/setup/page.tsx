// app/(auth)/setup/page.tsx (Step 1: Choose Product)
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { 
  MessageSquare, 
  Ticket, 
  BookOpen, 
  Globe, 
  ArrowRight,
  Check,
  Sparkles
} from "lucide-react";

const products = [
  {
    id: "live-chat",
    icon: MessageSquare,
    title: "Live Chat",
    description: "Add real-time chat to your website",
    features: ["Real-time messaging", "AI-powered responses", "Customizable widget"],
    color: "from-blue-500 to-cyan-500",
    popular: true,
  },
  {
    id: "ticketing",
    icon: Ticket,
    title: "Ticketing",
    description: "Turn conversations into tickets",
    features: ["Smart routing", "SLA management", "Team collaboration"],
    color: "from-purple-500 to-pink-500",
    popular: false,
  },
  {
    id: "knowledge-base",
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Create self-service content",
    features: ["Article management", "Search optimization", "Analytics"],
    color: "from-emerald-500 to-teal-500",
    popular: false,
  },
  {
    id: "pages",
    icon: Globe,
    title: "Brand Pages",
    description: "Get a dedicated support page",
    features: ["Custom domain", "Brand customization", "SEO friendly"],
    color: "from-orange-500 to-red-500",
    popular: false,
  },
];

export default function SetupProductPage() {
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<string>("live-chat");

  const handleContinue = () => {
    router.push("/setup/widget");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20 mb-3">
          <Sparkles className="w-3 h-3" />
          Step 1 of 6
        </div>
        <h1 className="text-2xl font-bold">Choose your first product</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
          Select which product you&apos;d like to set up first
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {products.map((product) => {
          const Icon = product.icon;
          const isSelected = selectedProduct === product.id;
          
          return (
            <button
              key={product.id}
              onClick={() => setSelectedProduct(product.id)}
              className={`group relative p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                  : "border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl"
              }`}
            >
              {product.popular && (
                <div className="absolute -top-2 -right-2 px-2 py-0.5 gradient-primary text-white text-[10px] font-medium rounded-full shadow-lg shadow-primary/25">
                  Popular
                </div>
              )}

              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 gradient-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/25">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${product.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{product.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {product.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleContinue}
        className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2"
      >
        Continue Setup
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}