import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  const plugins = [
    react(),
    nodePolyfills(), // To handle 'buffer' and other Node.js polyfills
  ];

  // Conditionally add the server-side API middleware only in development
  if (mode === 'development') {
    plugins.push({
      name: 'level-generator-api',
      async configureServer(server) {
        const generateLevelApi = (await import('./src/api/generateLevel')).default;
        server.middlewares.use('/api/generateLevel', (req, res, next) => {
          req.env = env;
          generateLevelApi(req, res, next);
        });
      },
    });
  }

  return {
    plugins,
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'wagmi-vendor': ['wagmi', 'viem', '@tanstack/react-query'],
            'neynar-vendor': ['@neynar/react'],
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    define: {
      // This is still useful if you have any client-side logic that needs env vars,
      // but the primary use (API key) is now handled server-side.
      'process.env.NODE_ENV': JSON.stringify(mode),
    },
  };
});