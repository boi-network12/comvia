import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, IntegrationProvider, ToastProvider } from "@/contexts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Comvia",
    template: "%s | Comvia",
  },
  description:
    "Comvia is a modern customer support platform that helps businesses connect with visitors through real-time live chat, customizable widgets, and AI-powered assistance.",
  keywords: [
    "customer support",
    "live chat",
    "chat widget",
    "support widget",
    "help desk",
    "customer service",
    "AI support",
    "real-time chat",
    "website chat",
    "Comvia",
  ],
  applicationName: "Comvia",
  authors: [{ name: "Comvia" }],
  creator: "Comvia",
  publisher: "Comvia",
  metadataBase: new URL("https://comvia.app"),
  openGraph: {
    title: "Comvia",
    description:
      "A modern live chat and customer support platform with customizable widgets and AI-powered assistance.",
    url: "https://comvia.app",
    siteName: "Comvia",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comvia",
    description:
      "Real-time customer support with customizable live chat and AI assistance.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>
          <AuthProvider>
            <IntegrationProvider>
              <div className="flex-1 flex flex-col">{children}</div>
            </IntegrationProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}