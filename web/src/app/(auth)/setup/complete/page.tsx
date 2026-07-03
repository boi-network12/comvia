// app/(auth)/setup/complete/page.tsx (Step 6: Complete)
"use client";

import { useRouter } from "next/navigation";
import { Check, Sparkles, ArrowRight, Users, MessageSquare, Palette, Zap } from "lucide-react";

export default function SetupCompletePage() {
  const router = useRouter();

  const stats = [
    { icon: MessageSquare, label: "Live Chat", value: "Active" },
    { icon: Palette, label: "Branding", value: "Customized" },
    { icon: Users, label: "Team Members", value: "Invited" },
    { icon: Zap, label: "Integrations", value: "Connected" },
  ];

  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-primary/30 animate-float">
        <Check className="w-10 h-10 text-white" />
      </div>

      <div>
        <h1 className="text-3xl font-bold">Setup Complete! 🎉</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Your Comvia workspace is ready. Here&apos;s what&apos;s been set up:
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800"
            >
              <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium">{stat.label}</p>
              <p className="text-xs text-green-500">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-3 pt-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="w-full py-3 gradient-primary text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all hover:scale-[1.02] font-medium flex items-center justify-center gap-2"
        >
          Go to Dashboard
          <ArrowRight className="w-4 h-4" />
        </button>
        
        <button
          onClick={() => router.push("/setup/widget")}
          className="w-full py-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all font-medium"
        >
          ← Back to Widget Setup
        </button>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        You can change all these settings later from your dashboard
      </p>
    </div>
  );
}