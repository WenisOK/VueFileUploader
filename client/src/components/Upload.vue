<template>
  <div>
    <div class="topBar">
      <div>文件上传</div>
    </div>
    <div class="container">
      <div class="fileTitle">文件信息</div>
      <input type="file" multiple ref="refInput" style="display: none" />
      <el-button
        type="primary"
        :icon="DocumentAdd"
        id="chooseFile"
        @click="chooseFile"
        >选择文件</el-button
      >
      <div class="fileInfo">
        <div><b>文件名: </b>{{ fileInfo.name }}</div>
        <div><b>文件大小: </b>{{ fileInfo.viewSize }}</div>
        <div><b>文件类型: </b>{{ fileInfo.viewType }}</div>
        <div><b>上传状态: </b>{{ fileInfo.status }}</div>
      </div>
      <el-button
        type="primary"
        id="uploadFile"
        :icon="Upload"
        :disabled="uploading"
        @click="upload"
        >上传
      </el-button>
      <br />
      <div class="progressDiv">
        <progress id="progress" ref="refProgress" value="0"></progress>
        {{ fileInfo.progress }}%
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { DocumentAdd, Upload } from "@element-plus/icons-vue";
import typeList from "../type";

const fileInfo = ref({
  name: "",
  viewSize: "",
  size: null,
  viewType: "",
  type: null,
  status: "未开始",
  progress: 0,
  lastModified: null,
});

const emit = defineEmits(["updateFileList"]);

const refInput = ref();
const refProgress = ref();
const uploading = ref(false);

const chooseFile = () => refInput.value.click();
onMounted(() => {
  refInput.value.addEventListener("change", (e) => {
    let event = e.target.files[0];
    if (event) {
      fileInfo.value.name = event.name;
      fileInfo.value.size = event.size;
      fileInfo.value.type = event.type;
      fileInfo.value.lastModified = event.lastModified;
      fileInfo.value.viewSize = (event.size / 1024 / 1024).toFixed(5) + "Mib";
      fileInfo.value.viewType = getFileTypes(event.type);
    }
    fileInfo.value.progress = 0;
    refProgress.value.value = 0;
  });
});

const upload = () => {
  if (refInput.value.files.length < 1) {
    return alert("文件未选择");
  }

  fileInfo.value.status = "发送中";

  let formData = new FormData();
  formData.append("file", refInput.value.files[0]);

  const xhr = new XMLHttpRequest();

  uploading.value = true;

  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const response = JSON.parse(xhr.response);
      if (xhr.status === 200 && response.status === 1) {
        fileInfo.value.status = "上传成功";
        emit("updateFileList");
      } else {
        fileInfo.value.status = "上传失败";
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

const getFileTypes = (e) => {
  if (e) return typeList[e] === undefined ? e : typeList[e];
  return "未知类型";
};
</script>
