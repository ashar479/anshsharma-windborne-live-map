import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/windborne': {
        target: 'https://a.windbornesystems.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/windborne/, ''),
      },
    },
  },
});
