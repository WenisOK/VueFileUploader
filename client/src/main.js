import { createApp } from "vue";
import "./style.css";
import "./style-dark.css";
import App from "./App.vue";
// Element-Plus
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// Pinia
import { createPinia } from "pinia";

createApp(App).use(ElementPlus).use(createPinia()).mount("#app");
