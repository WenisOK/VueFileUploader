<template>
  <div>
    <div class="topBar">
      <div>文件上传</div>
    </div>
    <div class="FileUpload">
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
        <el-progress
          id="progress"
          :text-inside="true"
          :status="fileInfo.progressStatus"
          :percentage="fileInfo.progressPercentage"
        ></el-progress>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, reactive } from "vue";
import { DocumentAdd, Upload } from "@element-plus/icons-vue";
import typeList from "../type";
import axios from "axios";

const fileInfo = reactive({
  name: "",
  viewSize: "",
  size: null,
  viewType: "",
  type: null,
  status: "未开始",
  lastModified: null,
  progressStatus: "",
  progressPercentage: 0,
});

const emit = defineEmits(["updateFileList"]);

const refInput = ref();
const uploading = ref(false);

const chooseFile = () => {
  refInput.value.click();
};
onMounted(() => {
  refInput.value.addEventListener("change", (e) => {
    let event = e.target.files[0];
    if (event) {
      fileInfo.name = event.name;
      fileInfo.size = event.size;
      fileInfo.type = event.type;
      fileInfo.lastModified = event.lastModified;
      fileInfo.viewSize = (event.size / 1024 / 1024).toFixed(5) + "Mib";
      fileInfo.viewType = getFileTypes(event.type);
      fileInfo.status = "未开始";
      fileInfo.progressPercentage = 0;
      fileInfo.progressStatus = "";
    }
  });
});

function upload() {
  if (refInput.value.files.length < 1) {
    return alert("文件未选择或重复上传");
  }

  fileInfo.status = "发送中";

  let formData = new FormData();
  formData.append("file", refInput.value.files[0]);

  uploading.value = true;

  axios({
    method: "POST",
    url: "/upload",
    params: {
      filename: fileInfo.name,
      size: fileInfo.size,
      lastModified: fileInfo.lastModified,
      type: fileInfo.type || "unknown",
    },
    data: formData,
    onUploadProgress: uploadProgress,
  }).then((res) => {
    if (res.data.status === 1) {
      uploading.value = false;
      fileInfo.status = "上传成功";
      fileInfo.progressStatus = "success";
      refInput.value.value = "";
      emit("updateFileList");
    }
  });
}

function uploadProgress(e) {
  fileInfo.progressPercentage = (e.loaded / e.total) * 100;
}

function getFileTypes(e) {
  if (e) return typeList[e] === undefined ? e : typeList[e];
  return "未知类型";
}
</script>
