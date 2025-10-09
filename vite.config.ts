import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import generateLevelApi from './src/api/generateLevel';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({ mode }) => {
  // Load environment variables from .env file
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      nodePolyfills(), // To handle 'buffer' and other Node.js polyfills
      {
        name: 'level-generator-api',
        configureServer(server) {
          // Pass environment variables to the API route
          server.middlewares.use('/api/generateLevel', (req, res, next) => {
            req.env = env;
            generateLevelApi(req, res, next);
          });
        },
      },
    ],
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