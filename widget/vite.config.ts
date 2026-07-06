// widget/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import replace from '@rollup/plugin-replace';

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
  define: {
    'global': 'window',
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/widget.tsx'),
      name: 'ComviaWidget',
      fileName: () => 'comvia-widget.min.js',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
      output: {
        name: 'ComviaWidget',
        exports: 'named',
        footer: `
          if (typeof window !== 'undefined') {
            window.ComviaWidget = window.ComviaWidget || {};
            window.ComviaWidget.init = window.initComviaWidget;
            window.ComviaWidget.destroy = window.destroyWidget;
          }
        `,
      },
      plugins: [
        // @ts-ignore - Ignore TypeScript error
        replace({
          'process.env.NODE_ENV': JSON.stringify('production'),
          'process.env': JSON.stringify({ NODE_ENV: 'production' }),
          preventAssignment: true,
        }),
      ],
    },
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    target: 'es2015',
    emptyOutDir: true,
    cssCodeSplit: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    cors: true,
  },
});