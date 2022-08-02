import { defineStore } from "pinia";
export const useServerStore = defineStore("server", {
  state: () => {
    return {
      server: {
        serverStatus: "unknow",
      },
    };
  },
});
