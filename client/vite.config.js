import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    port: 8888,
    proxy: {
      "/upload": "http://localhost:2222",
      "/fileList": "http://localhost:2222",
      "/downloadFile": "http://localhost:2222",
      "/deleteFile": "http://localhost:2222",
    },
  },
});
