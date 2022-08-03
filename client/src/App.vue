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
// 引入模块
import Upload from "./components/Upload.vue";
import Lists from "./components/Lists.vue";
import { onMounted, reactive, ref, watch } from "vue";
import { useClientStore } from "./store/client";
import { Moon, Sunny } from "@element-plus/icons-vue";
// 定义变量
const clientStore = useClientStore();
const pageMode = reactive({ pageMode: "light" });
const ListsRef = ref(null);
// 加载执行
onMounted(() => {
  // 监听改变页面模式
  watch(
    pageMode,
    (value) => {
      clientStore.$state.page.pageMode = value.pageMode;
    },
    { deep: true }
  );
  // 监听pinia变化
  clientStore.$subscribe((mutation, state) => {
    if (state.page.pageMode == "dark") {
      document.body.style.backgroundColor = "#1a1a1a";
    } else {
      document.body.style.backgroundColor = "";
    }
  });
  // 检测是否为dark模式
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    pageMode.pageMode = "dark";
  }
});
function updateFileList() {
  ListsRef.value.getFileList();
}
</script>
