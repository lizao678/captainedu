import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import gzipPlugin from "rollup-plugin-gzip";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 9797,
    proxy: {
        '/api': {
          target: 'http://127.0.0.1:9898',  // 后端 API 地址
          changeOrigin: true,
          secure: false,
        //   rewrite: (path) => path.replace(/^\/backend/, '/api')
        },
      },
  },
  plugins: [
    react(),
    legacy({
      targets: ["chrome 52"],
      additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
      renderLegacyChunks: true,
      modernPolyfills: true,
    }),
  ],
  build: {
    rollupOptions: {
      plugins: [gzipPlugin()],
    },
  },
});
