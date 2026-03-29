import react from '@vitejs/plugin-react';
import { type ProxyOptions, defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // In Docker development, default to central_manager if not set
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://central_manager:8000';
  
  const proxyConfig: Record<string, ProxyOptions | string> = {
    '/api/v1': {
      target: proxyTarget,
      changeOrigin: true,
      secure: false,
    },
  };

  return {
    plugins: [react()],
    server: {
      port: 9556,
      host: true,
      origin: 'https://front-user.mythicuser.cloudns.nz:9443',
      allowedHosts: ['front-user.mythicuser.cloudns.nz', 'devel.mythicuser.cloudns.nz', 'localhost', '.mythicuser.cloudns.nz'],
      proxy: proxyConfig,
    },
    preview: {
      port: 9556,
      host: true,
      allowedHosts: ['front-user.mythicuser.cloudns.nz', 'devel.mythicuser.cloudns.nz', 'localhost', '.mythicuser.cloudns.nz'],
      proxy: proxyConfig,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
    },
  };
});