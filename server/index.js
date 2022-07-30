const http = require("http");
const path = require("path");
const express = require("express");
const fs = require("fs");
const { randomUUID } = require("crypto");
let app = express();

// initialize fileList memory database
let lastFileList = "";
const filesPath = path.normalize(path.resolve(path.join(__dirname, "./files")));
let fileList;
try {
  fileList = JSON.parse(fs.readFileSync(path.normalize(path.relsolve(path.join(__dirname,"./fileList.json")))));
} catch {
  fileList = [];
}
// initialize files folder
try {
  fs.mkdirSync(filesPath);
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
  next()
});

app.get("/fileList", (req, res) => {
  res.send(fileList);
});

app.post("/deleteFile", (req, res, next) => {
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
      try {
        fs.unlinkSync(path.normalize(path.resolve(path.join(filesPath`./${req.body.fileId}`))));
        fileList.splice(index, 1);
        res.send({ status: 1 });
      } catch (e) {
        next(e);
      }
    } else {
      res.send({ status: 0 });
    }
  } else {
    res.send({ status: -999 });
  }
})

app.get("/downloadFile", (req, res, next) => {
  if (req.query.fileId) {
    let file = fileList.find((file) => file.fileId === req.query.fileId);
    if (file) {
      res.setHeader("Content-type", "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${file.fileNameWithExt}`
      );
      try {
        fs.createReadStream(path.normalize(path.resolve(path.join(filesPath, `./${req.query.fileId}`)))).pipe(res);
      } catch (e) {
        next(e);
      }
    } else {
      res.send("<h2>no such file</h2>");
    }
  } else {
    res.send("<h2>fileId required</h2>");
  }
});

app.post("/upload", (req, res, next) => {
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
    let recvFlag = true;
    const stream = fs.createWriteStream(path.normalize(path.resolve(path.join(filesPath, `./${fileId}`))), { flags: "w+" });

    req.on("data", (chunk) => {
      if (!recvFlag) return;
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
        stream.write(piece, e => {
          if (e) {
            recvFlag = false;
            next(e);
          }
        });
      }
    });

    req.on("error", () => {
      // request is canceled or request is aborted
      stream.end();
      fs.unlinkSync(path.normalize(path.resolve(path.join(filesPath, `./${fileId}`))));
    });

    req.on("end", () => {
      if (!recvFlag) return;
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

app.use((req, res) => {
  res.status(404);
  res.send({ status: -2 });
});

app.use((error, req, res, next) => {
  res.status(500);
  res.send({ status: -1 });
  console.log(error);
})

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
