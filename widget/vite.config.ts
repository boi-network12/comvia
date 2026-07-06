// widget/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/widget.tsx'),
      name: 'ComviaWidget',
      fileName: () => 'comvia-widget.min.js',
      formats: ['iife'], // ✅ Use IIFE only - it's the most compatible
    },
    rollupOptions: {
      external: [],
      output: {
        
        // ✅ This ensures window.ComviaWidget is available
        name: 'ComviaWidget',
        exports: 'named',
        // ✅ Add footer to ensure global is set
        footer: `
          if (typeof window !== 'undefined') {
            window.ComviaWidget = window.ComviaWidget || {};
            window.ComviaWidget.init = window.initComviaWidget;
            window.ComviaWidget.destroy = window.destroyWidget;
          }
        `,
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    target: 'es2015',
    emptyOutDir: true,
    // ✅ Ensure CSS is included
    cssCodeSplit: false,
  },
  server: {
    port: 5173,
    cors: true,
  },
});