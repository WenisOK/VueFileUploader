<template>
  <div>
    <div class="topBar">
      <div>文件上传</div>
    </div>
    <div class="container">
      <div class="fileTitle">文件信息</div>
      <input type="file" ref="refInput" style="display: none" />
      <button id="chooseFile" @click="chooseFile">选择文件</button>
      <div class="fileInfo">
        <div>文件名: {{ fileInfo.name }}</div>
        <div>文件大小: {{ fileInfo.viewSize }}</div>
        <div>文件类型: {{ fileInfo.viewType }}</div>
        <div>上传状态: {{ fileInfo.status }}</div>
      </div>
      <button id="chooseFile" :disabled="uploading" @click="upload">
        上传
      </button>
      <br />
      <div class="progressDiv">
        <progress id="progress" ref="refProgress" value="0"></progress>
        {{ fileInfo.progress }}%
      </div>
    </div>
  </div>
</template>
<script setup>
// 引入一些
import { ref, onMounted } from "vue";
import typeList from "./type";
const fileInfo = ref({
  name: "",
  viewSize: "",
  size: null,
  viewType: "",
  type: null,
  status: "",
  progress: 0,
  lastModified: null,
});
const refInput = ref();
const refProgress = ref();
const uploading = ref(false);
const chooseFile = () => {
  refInput.value.click();
};
onMounted(() => {
  // 监听文件改变事件
  refInput.value.addEventListener("change", (e) => {
    if (e.target.files[0]) {
      fileInfo.value.name = e.target.files[0].name;
      fileInfo.value.viewSize =
        (e.target.files[0].size / 1024 / 1024).toFixed(5) + "MB";
      fileInfo.value.size = e.target.files[0].size;
      fileInfo.value.viewType = getFileTypes(e.target.files[0].type);
      fileInfo.value.type = e.target.files[0].type;
      fileInfo.value.lastModified = e.target.files[0].lastModified;
    }
  });
});
const upload = () => {
  if (refInput.value.files.length < 1) {
    return alert("文件未选择");
  }
  fileInfo.value.status = "发送中";
  let formData = new FormData();
  formData.append("file", refInput.value.files[0]);
  uploading.value = true;
  const xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const response = JSON.parse(xhr.response);
      if (response.status === 1) {
        fileInfo.value.status = "成功";
      } else {
        fileInfo.value.status = "失败";
      }
      uploading.value = false;
    }
  };
  xhr.upload.onprogress = (e) => {
    refProgress.value.max = e.total;
    refProgress.value.value = e.loaded;
    fileInfo.value.progress = parseInt((e.loaded / e.total) * 100);
  };
  xhr.open(
    "POST",
    `/upload?filename=${fileInfo.value.name}&type=${
      fileInfo.value.type ? fileInfo.value.type : "unknow"
    }&size=${fileInfo.value.size}&lastModified=${fileInfo.value.lastModified}`
  );
  xhr.send(formData);
};
// 文件类型
const getFileTypes = (e) => {
  if (e) return typeList[e] === undefined ? e : typeList[e];
  return "未知类型";
};
</script>
