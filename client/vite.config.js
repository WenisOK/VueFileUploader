import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    proxy: {
      "/upload": "http://localhost:2222",
      // rewrite: path = path.replace("\/")
    },
  },
});
