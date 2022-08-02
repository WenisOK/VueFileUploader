import { defineStore } from "pinia";
export const useClientStore = defineStore("client", {
  state: () => {
    return {
      page: {
        pageMode: "light",
      },
    };
  },
});
