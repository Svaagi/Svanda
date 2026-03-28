import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      assets: path.resolve(__dirname, './src/assets'),
      constants: path.resolve(__dirname, './src/constants'),
      features: path.resolve(__dirname, './src/features'),
      types: path.resolve(__dirname, './src/types'),
      utils: path.resolve(__dirname, './src/utils'),
    },
  },
});
