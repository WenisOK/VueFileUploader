import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  base: "./",
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    // 项目运行端口
    port: 8888,
    // 如需使用nginx转发，请注释掉如下参数
    proxy: {
      "/upload": "http://localhost:2222",
      "/fileList": "http://localhost:2222",
      "/downloadFile": "http://localhost:2222",
      "/deleteFile": "http://localhost:2222",
    },
  },
});
