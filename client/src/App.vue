<template>
  <div>
    <div class="topBar">
      <div>
        文件上传
        <el-switch
          style="color: gray"
          v-model="pageMode.pageMode"
          active-value="dark"
          inactive-value="light"
          :active-icon="Moon"
          :inactive-icon="Sunny"
          inline-prompt
        />
      </div>
    </div>
    <Upload @update-file-list="updateFileList" />
    <Lists ref="ListsRef" />
    <div></div>
  </div>
</template>
<script setup>
import Upload from "./components/Upload.vue";
import Lists from "./components/Lists.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { useClientStore } from "./store/client";
import { Moon, Sunny } from "@element-plus/icons-vue";

const clientStore = useClientStore();

const pageMode = reactive({ pageMode: "light" });

const ListsRef = ref(null);

onMounted(() => {
  watch(
    pageMode,
    (value) => {
      clientStore.$state.page.pageMode = value.pageMode;
    },
    { deep: true }
  );
  clientStore.$subscribe((mutation, state) => {
    if (state.page.pageMode == "dark") {
      document.body.style.backgroundColor = "#1a1a1a";
    } else {
      document.body.style.backgroundColor = "";
    }
  });
});
function updateFileList() {
  ListsRef.value.getFileList();
}
</script>
