<template>
  <div>
    <a :href="'/downloadFile?fileId=' + props.uuid" target="_blank"
      ><el-button class="operationButton" type="primary" :icon="Download"
        >下载</el-button
      ></a
    >
    <el-button
      class="operationButton"
      type="danger"
      :icon="Delete"
      @click="deleteFile"
      >删除</el-button
    >
  </div>
</template>
<script setup>
import { Download, Delete } from "@element-plus/icons-vue";
import axios from "axios";
const props = defineProps({
  uuid: {
    type: String,
  },
});

const emit = defineEmits(["getFileList"]);

const deleteFile = () => {
  axios({
    method: "POST",
    url: "/deleteFile",
    data: {
      fileId: props.uuid,
    },
  }).then((res) => {
    if (res.data.status) {
      alert("删除成功！");
      emit("getFileList", true);
    }
  });
};
</script>
