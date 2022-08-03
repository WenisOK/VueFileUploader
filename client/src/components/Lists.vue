<template>
  <div :mode="darkMode ? 'dark' : 'light'" class="listsTable">
    <el-table :data="tableData">
      <el-table-column
        sortable
        fixed="left"
        class="idTableColumn"
        prop="id"
        label="id"
        width="64"
      />
      <el-table-column sortable prop="name" label="文件名" />
      <el-table-column sortable prop="type" label="类型" />
      <el-table-column fixed="right" prop="operation" label="操作" width="100">
        <template #default="scope">
          <Options @get-file-list="getFileList" :uuid="scope.row.uuid" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
// 引入模块
import { onMounted, reactive, ref } from "vue";
import axios from "axios";
import Options from "./Options.vue";
import types from "../type";
import { useClientStore } from "../store/client";

defineExpose({
  getFileList,
});

const tableData = reactive([]);
let fileListBak = "";
const darkMode = ref(false);
const clientStore = useClientStore();

function getFileList() {
  axios({
    method: "GET",
    url: "/fileList",
  })
    .then((res) => {
      if (res.status === 200) {
        if (JSON.stringify(res.data) !== fileListBak) {
          console.log("数据有变化");
          Object.keys(tableData).map((key) => {
            delete tableData[key];
          });
          for (let i = 0; i < res.data.length; i++) {
            const result = {
              name: res.data[i].fileNameWithExt,
              id: i + 1,
              type: types[res.data[i].type] || "未知类型",
              uuid: res.data[i].fileId,
            };
            tableData[i] = result;
          }
          fileListBak = JSON.stringify(res.data);
        } else {
          console.log("数据无变化");
        }
      }
    })
    .catch((err) => {
      if (err.code == "ERR_BAD_RESPONSE") {
      }
    });
}

clientStore.$subscribe((mutation, state) => {
  darkMode.value = state.page.pageMode === "dark" ? true : false;
});

onMounted(() => {
  getFileList();
  setInterval(() => getFileList(), 5000);
});
</script>
