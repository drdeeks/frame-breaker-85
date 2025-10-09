import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import generateLevelApi from './src/api/generateLevel';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig(() => {
    return {
      plugins: [
        react(),
        {
          name: 'level-generator-api',
          configureServer(server) {
            server.middlewares.use('/api/generateLevel', generateLevelApi);
          },
        },
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          'buffer': 'buffer/',
        }
      }
    };
});
