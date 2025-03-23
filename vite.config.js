import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Enable JSX in .js files (optional)
      include: ['**/*.jsx', '**/*.js'] 
    })
  ],
  base: '/personal_tutor/',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    }
  },
  //  root: './client',
  esbuild: {
    // jsx: 'automatic',
    jsxInject: `import React from 'react'`
  }
});