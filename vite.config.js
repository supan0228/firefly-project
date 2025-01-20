import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: './',
  plugins: [vue()],
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          'three-addons': ['three/addons/controls/OrbitControls.js', 
                          'three/addons/postprocessing/EffectComposer.js',
                          'three/addons/postprocessing/RenderPass.js',
                          'three/addons/postprocessing/UnrealBloomPass.js']
        }
      }
    }
  }
})
