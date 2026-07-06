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
    // ✅ Use widget.tsx as entry for production build
    lib: {
      entry: path.resolve(__dirname, 'src/widget.tsx'),
      name: 'ComviaWidget',
      fileName: (format) => `comvia-widget.min.${format === 'umd' ? 'js' : format === 'iife' ? 'js' : 'js'}`,
      formats: ['iife', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    outDir: 'dist',
    sourcemap: true,
    minify: true,
    target: 'es2015',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    cors: true,
  },
});