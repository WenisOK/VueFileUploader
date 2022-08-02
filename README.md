# 基于 Vue3 + Vite3 的文件上传功能

## 开发人员

[@WenisOK](https://github.com/Wenisok)  
[@iy88](https://github.com/iy88)

## 使用文档

### 一、克隆代码到本地

```shell
git clone https://github.com/WenisOK/VueFileUploader.git
```

### 二、使用开发环境运行

1. 客户端

```shell
cd ./client
yarn
yarn dev
#OR 或者
npm i
npm run dev
```

2. 服务端

```shell
cd ./server
yarn
yarn serve
#OR
npm i
npm run serve
```

### 三、使用 Nginx 转发

1. 构建前端代码

```shell
cd ./client
yarn
yarn build
#OR 或者
npm i
npm run build
```

2. 将`dist`解析到`nginx`的`location`里，确保能访问
3. 配置如下的代理: `/upload`,`/fileList`,`/connTest`,`/deleteFile`,`/downloadFile`转发到`http://localhost:2222`

### 四、访问

[http://localhost:8888](http://localhost:8888)
