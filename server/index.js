const http = require("http");
const path = require("path");
const express = require("express");
const fs = require("fs");
const { randomUUID } = require("crypto");
let app = express();

// initialize fileList memory database
let lastFileList = "";
let fileList;
try {
  fileList = JSON.parse(fs.readFileSync(path.normalize(path.resolve(path.join(__dirname, "./fileList.json")))));
} catch {
  fileList = [];
}
// initialize files folder
try {
  fs.mkdirSync(path.normalize(path.resolve(path.join(__dirname, "./files"))));
} catch {
  // folder is already existed, do nothing...
}


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(
    `[${new Date().toJSON()}][info]`,
    req.method,
    req.originalUrl,
    req.query,
    req.body,
    req.headers
  );
  next();
});

app.get("/fileList", (req, res) => {
  res.send(fileList);
});

app.post("/deleteFile", (req, res) => {
  if (req.body.fileId) {
    let flag = false;
    let index;
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i].fileId === req.body.fileId) {
        flag = true;
        index = i;
        break;
      }
    }
    if (flag) {
      fs.unlinkSync(path.normalize(path.resolve(path.join(__dirname, `./files/${req.body.fileId}`))));
      fileList.splice(index, 1);
      res.send({ status: 1 });
    } else {
      res.send({ status: 0 });
    }
  } else {
    res.send({ status: -999 });
  }
})

app.get("/downloadFile", (req, res) => {
  if (req.query.fileId) {
    let file = fileList.find((file) => file.fileId === req.query.fileId);
    if (file) {
      res.setHeader("Content-type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.fileNameWithExt}`
      );
      fs.createReadStream(path.normalize(path.resolve(path.join(__dirname, `./files/${req.query.fileId}`)))).pipe(res);
    } else {
      res.send("<h2>no such file</h2>");
    }
  } else {
    res.send("<h2>fileId required</h2>");
  }
});

app.post("/upload", (req, res) => {
  if (
    req.query.filename &&
    req.query.type &&
    req.query.size &&
    req.query.lastModified
  ) {
    let fileId = randomUUID();
    let boundary = req.headers["content-type"]
      .split("; ")[1]
      .split("boundary=")[1];
    const calcLength = (
      + 2 + Buffer.from(boundary).length + 2 // --$boudary\r\n
      + 55 + Buffer.from(req.query.filename).length + 1 + 2 // Content-Disposition: form-data; name="file"; filename="$filename"\r\n
      + 14 + Buffer.from(req.query.type ? req.query.type : "application/octet-stream").length + 2 // Content-Type: $type\r\n
      + 2 // \r\n
    );
    let recvBinaryLength = 0;
    let recvFileLength = 0;
    const stream = fs.createWriteStream(`./files/${fileId}`, { flags: "w+" });
    req.on("data", (chunk) => {
      // recv data length not more than header data length
      if (recvBinaryLength + chunk.length < calcLength) {
        recvBinaryLength += chunk.length;
      }
      // recv data length more than or equal header data length
      else if (recvBinaryLength + chunk.length >= calcLength) {
        let start = chunk.length - (recvBinaryLength + chunk.length - calcLength - recvFileLength); // more than header data length index and not recv progress
        let end = recvBinaryLength + chunk.length >= calcLength + parseInt(req.query.size) ?
          chunk.length - (recvBinaryLength + chunk.length - calcLength - parseInt(req.query.size)) :
          undefined;
        let piece = chunk.slice(start, end);
        recvFileLength += piece.length;
        recvBinaryLength += chunk.length;
        stream.write(piece);
      }
    });
    req.on("end", () => {
      stream.end();
      fileList.push({
        fileId: fileId,
        fileNameWithExt: req.query.filename,
        type: req.query.type,
        lastModified: parseInt(req.query.lastModified),
      });
      res.send({ status: 1 });
    });
  } else {
    res.send({ status: -999 });
  }
});
http.createServer(app).listen(2222, () => {
  console.log("server started");
  setInterval(() => {
    let nowFileListJSON = JSON.stringify(fileList);
    if (lastFileList !== nowFileListJSON) {
      fs.writeFileSync(path.normalize(path.resolve(path.join(__dirname, "./fileList.json"))), nowFileListJSON, { flag: "w+" });
      lastFileList = nowFileListJSON;
      console.log("fileList.json updated");
    }
  }, 10);
});
