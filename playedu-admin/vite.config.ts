import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import gzipPlugin from "rollup-plugin-gzip";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
        '/backend': {
          target: 'http://127.0.0.1:9898',  // 后端 API 地址
          changeOrigin: true,
          secure: false,
        //   rewrite: (path) => path.replace(/^\/backend/, '/api')
        },
      },
  },
  plugins: [react()],
  build: {
    rollupOptions: {
      plugins: [gzipPlugin()],
    },
  },
});
