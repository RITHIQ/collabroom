import { defineConfig, loadEnv } from 'vite'
import type { ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const openaiKey = (env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY || '').trim()

  const openaiProxy: ProxyOptions = {
    target: 'https://api.openai.com',
    changeOrigin: true,
    secure: true,
    rewrite: (p) => p.replace(/^\/__openai/, ''),
    configure(proxy) {
      proxy.on('proxyReq', (proxyReq) => {
        if (openaiKey) proxyReq.setHeader('Authorization', `Bearer ${openaiKey}`)
      })
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: { '/__openai': openaiProxy },
    },
    preview: {
      port: 4173,
      proxy: { '/__openai': openaiProxy },
    },
  }
})
