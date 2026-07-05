// app/(routes)/layout.tsx
"use client";

import { DashboardSidebar } from "@/components/Routes/static/DashboardSidebar";
import { SetupWarning } from "@/components/Routes/static/SetupWarning";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "../_components/ProtectedRoute";
import { LoadingComponent } from "@/contexts";
import { useEffect, useState } from "react";
import { Sparkles, Zap, Rocket, Star, Heart, Coffee, Target, Award, TrendingUp, MessageSquare } from "lucide-react";

export default function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [motivationIndex, setMotivationIndex] = useState(0);

  // Motivational messages with icons
  const motivationalMessages = [
    { text: "You're doing great today! ✨", icon: Sparkles },
    { text: "Keep up the amazing work! 🚀", icon: Rocket },
    { text: "Every conversation matters! 💬", icon: MessageSquare },
    { text: "You're making a difference! 🌟", icon: Star },
    { text: "Stay focused, stay awesome! ⚡", icon: Zap },
    { text: "Your team is lucky to have you! ❤️", icon: Heart },
    { text: "One step at a time! 🎯", icon: Target },
    { text: "You're crushing it! 💪", icon: Award },
    { text: "Support excellence in action! 📈", icon: TrendingUp },
    { text: "Have a productive day! ☕", icon: Coffee },
  ];

  // Rotate messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMotivationIndex((prev) => (prev + 1) % motivationalMessages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [motivationalMessages.length]);

  // Log authentication state for debugging
  useEffect(() => {
    console.log('RoutesLayout - Auth State:', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasToken: !!localStorage.getItem('accessToken'),
      pathname,
      isLoading 
    });
  }, [isAuthenticated, user, pathname, isLoading]);

  // Get current message
  const currentMessage = motivationalMessages[motivationIndex];
  const IconComponent = currentMessage.icon;

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingComponent loading={true} message="Loading..." variant="spinner" />
      </div>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated || !user) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingComponent loading={true} message="Redirecting to login..." variant="spinner" />
        </div>
      </ProtectedRoute>
    );
  }

  // For protected routes, wrap with ProtectedRoute
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-gray-50/50 dark:bg-gray-900/20">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
          <SetupWarning />
          <main className="flex-1">
            {/* Mobile Motivational Bar */}
            <div className=" w-full py-2.5 px-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/10 flex items-center justify-center gap-2.5 overflow-hidden">
              <div className="flex items-center gap-2.5 animate-fade-in">
                <div className="p-1 rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <IconComponent className="w-3.5 h-3.5" />
                </div>
                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px] sm:max-w-[300px]">
                  {currentMessage.text}
                </p>
              </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 lg:px-8 py-4 lg:py-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}