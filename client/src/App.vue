<template>
  <div>
    <Upload @update-file-list="updateFileList" />
    <Lists ref="ListsRef" />
    <el-button @click="updateFileList">111</el-button>
  </div>
</template>
<script setup>
import Upload from "./components/Upload.vue";
import Lists from "./components/Lists.vue";
import { ref } from "vue";

const ListsRef = ref(null);

function updateFileList() {
  ListsRef.value.getFileList();
}
</script>
