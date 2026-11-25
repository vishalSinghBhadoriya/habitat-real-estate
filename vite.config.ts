import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { copyFile } from 'node:fs/promises'
import { resolve } from 'node:path'
export default defineConfig(({mode})=>({
 base:mode==='github-pages'?'/habitat-real-estate/':'/',
 plugins:[react(),tailwind(),{
  name:'github-pages-spa-fallback',
  apply:'build',
  async writeBundle(options){
   if(mode==='github-pages'&&options.dir){
    await copyFile(resolve(options.dir,'index.html'),resolve(options.dir,'404.html'))
   }
  }
 }],
 resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},
 build:{rollupOptions:{output:{manualChunks(id){
  if(id.includes('/node_modules/@supabase/'))return 'supabase'
 }}}},
 test:{environment:'jsdom'}
}))
