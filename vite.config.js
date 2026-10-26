import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'index.html'),
        category: resolve(import.meta.dirname, 'category.html'),
        product: resolve(import.meta.dirname, 'product.html'),
        wishlist: resolve(import.meta.dirname, 'wishlist.html'),
        about: resolve(import.meta.dirname, 'about.html'),
      },
    },
  },
});
