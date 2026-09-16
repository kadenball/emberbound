import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Startup awaits Preferences. Keep the plugin runtime outside the startup
        // chunk so its lazy web implementation cannot import that waiting chunk.
        manualChunks(id) {
          if (id.includes('/node_modules/@capacitor/')) return 'capacitor';
        },
      },
    },
  },
});
