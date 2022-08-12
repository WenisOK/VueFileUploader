const http = require("http");
const path = require("path");
const express = require("express");
const fs = require("fs");
const { randomUUID } = require("crypto");
let app = express();
const endLineSignal = Buffer.from("\r\n");

// initialize fileList memory database
let lastFileList = "";
const filesPath = path.normalize(path.resolve(path.join(__dirname, "./files")));
let fileList;
try {
  fileList = JSON.parse(fs.readFileSync(path.normalize(path.resolve(path.join(__dirname, "./fileList.json")))));
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

app.all("/connTest", (req, res) => {
  res.send({ status: 1 })
})

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
        fs.unlinkSync(path.normalize(path.resolve(path.join(filesPath, `./${req.body.fileId}`))));
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
  if (req.query.lastModified) {
    let fileId = randomUUID();
    let contentLength = parseInt(req.headers["content-length"]);
    let endLineSignalCount = 0;
    let headerEndIndex = -1;
    let headerCache = [];
    let headerLength = 0;
    let header;
    let dataLength = 0;
    let needTransferLength;
    let fileName;
    let fileType;
    let fileDataStream;
    let recvFlag = true;
    req.on("data", chunk => {
      if (!recvFlag) return;
      if (headerEndIndex === -1) {
        for (let i = 0; i < chunk.length - 1; i++) {
          if (chunk[i] === endLineSignal[0] && chunk[i + 1] === endLineSignal[1]) {
            endLineSignalCount++;
            if (endLineSignalCount === 4) {
              headerEndIndex = i + 1;
              break;
            }
          }
        }
        if (headerEndIndex > -1) {
          headerCache.push(chunk.slice(0, headerEndIndex + 1));
          headerLength += headerEndIndex + 1;
          header = Buffer.concat(headerCache, headerLength);
          // let fileDataChunk = chunk.slice(headerEndIndex + 1);
          let slices = header.toString().split("\r\n");
          needTransferLength = contentLength - endLineSignal.length - slices[0].length - "--".length - endLineSignal.length;
          fileName = slices[1].split("; ")[2].split(`="`)[1].slice(0, -1);
          fileType = slices[2].split(": ")[1];
          console.log(fileName, fileType);
          fileDataStream = fs.createWriteStream(path.normalize(path.resolve(path.join(filesPath, `./${fileId}`))), { flags: "w+" });
          // fileDataStream.write(fileDataChunk);
          if (dataLength + chunk.length >= needTransferLength) {
            fileDataStream.write(chunk.slice(headerEndIndex + 1, needTransferLength - dataLength), e => {
              if (e) {
                recvFlag = false;
                next(e);
              }
            });
          } else {
            fileDataStream.write(chunk.slice(headerEndIndex + 1), e => {
              if (e) {
                recvFlag = false;
                next(e);
              }
            });
          }
        } else {
          headerCache.push(chunk);
          headerLength += chunk.length;
        }
      } else {
        if (dataLength + chunk.length >= needTransferLength) {
          fileDataStream.write(chunk.slice(0, needTransferLength - dataLength), e => {
            if (e) {
              recvFlag = false;
              next(e);
            }
          });
        } else {
          fileDataStream.write(chunk.slice(0), e => {
            if (e) {
              recvFlag = false;
              next(e);
            }
          });
        }
      }
      dataLength += chunk.length;
    });

    req.on("end", () => {
      if (!recvFlag) return;
      fileDataStream.end();
      fileList.push({
        fileId: fileId,
        fileNameWithExt: fileName,
        type: fileType,
        lastModified: parseInt(req.query.lastModified),
      });
      res.send({ status: 1 });
    });

    req.on("error", () => {
      // request is canceled or request is aborted
      fileDataStream.end();
      fs.unlinkSync(path.normalize(path.resolve(path.join(filesPath, `./${fileId}`))), e => {
        if (e) {
          recvFlag = false;
          next(e);
        }
      });
    });

  } else {
    res.send({ status: -999 });
  }
})

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
