// src/components/Widget/WidgetFooter.tsx

import React from 'react';
import { Shield } from 'lucide-react';

export const WidgetFooter: React.FC = () => {
  return (
    <div className="px-4 py-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-center gap-1.5">
        <Shield className="w-3 h-3 text-gray-400" />
        <span className="text-[10px] text-gray-400">
          Powered by <span className="font-medium text-gray-500 dark:text-gray-300">Comvia</span>
        </span>
      </div>
    </div>
  );
};