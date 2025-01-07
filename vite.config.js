import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      "@vueuse/motion": fileURLToPath(new URL("./node_modules/@vueuse/motion", import.meta.url)), // Add this
    }
  }
})

/*export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // Add this to the config to allow motion-* components as custom elements
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag.startsWith('motion-'),  // Treat motion-* tags as custom elements
    },
  },
})*/
