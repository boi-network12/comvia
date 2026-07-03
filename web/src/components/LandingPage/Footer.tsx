// components/LandingPage/Footer.tsx
"use client";

import Link from "next/link";
import { FaTwitter, FaLinkedin, FaGithub, FaGlobe } from "react-icons/fa";
import { FiMail } from "react-icons/fi";

export default function Footer() {
  const footerLinks = {
    Product: ["Features", "Pricing", "Integrations", "Changelog"],
    Company: ["About", "Blog", "Careers", "Press"],
    Support: ["Help Center", "Documentation", "Contact", "Status"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
  };

  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-sm mb-4 tracking-wider uppercase text-gray-500 dark:text-gray-400">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-foreground transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200/50 dark:border-gray-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xs">C</span>
            </div>
            <span className="font-semibold">Comvia</span>
            <span className="text-sm text-gray-400">© 2026</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-6">
            <Link 
              href="#" 
              aria-label="Twitter"
              className="text-gray-400 hover:text-foreground transition-all hover:scale-110 transform"
            >
              <FaTwitter className="w-5 h-5" />
            </Link>
            <Link 
              href="#" 
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-foreground transition-all hover:scale-110 transform"
            >
              <FaLinkedin className="w-5 h-5" />
            </Link>
            <Link 
              href="#" 
              aria-label="GitHub"
              className="text-gray-400 hover:text-foreground transition-all hover:scale-110 transform"
            >
              <FaGithub className="w-5 h-5" />
            </Link>
            <Link 
              href="#" 
              aria-label="Email"
              className="text-gray-400 hover:text-foreground transition-all hover:scale-110 transform"
            >
              <FiMail className="w-5 h-5" />
            </Link>
            <Link 
              href="#" 
              aria-label="blog"
              className="text-gray-400 hover:text-foreground transition-all hover:scale-110 transform"
            >
              <FaGlobe className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}