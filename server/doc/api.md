### GET `/fileList` use to get fileList of all uploaded files
#### `parameter`:
- *`fileId`* type: `querystring` use to tell the server which file need to download.
#### `response` type:`JSON`:
- `success`: `{status:1}`
- `failed`: 
  - `{status:0}` cause by fileId not found
  - `{status:-999}` cause by parameter not be given correctly
---
### GET `/downloadFile` use to download uploaded file
#### `parameter`:
- *`fileId`* type: `querystring` use to tell the server which file need to download
#### `response`:
- `success`: behavior like normal download link
- `failed`: 
  - ```<h2>no such file</h2> ``` cause by fileId not found
  - ```<h2>fileId required</h2>``` cause by parameter not be given correctly
---
### POST `/deleteFile` use to delete uploaded file
#### `parameter`:
- *`fileId`* type: `querystring` use to tell the server which file need to download.
#### `response` type:`JSON`:
- `success`: `{status:1}`
- `failed`: 
  - `{status:0}` cause by fileId not found
  - `{status:-999}` cause by parameter not be given correctly
---
#### POST `/upload` use to upload file
#### `parameter`:
- *`filename`* type:`querystring` which be given by browser(*`file object`*)
- *`type`* type:`querystring` which be given by browser(*`file object`*) especially, when browser give `""` result, type should be `"unknow"`
- *`size`* type:`querystring` which be given by browser(*`file object`*)
- *`lastModified`* type:`querystring` which be given by browser(*`file object`*)
- *`postData`* type:`fromData` which could generate by:
```
  let formData = new FormData();
  formData.append("file", FILE_OBJECT); // "file" -- first argument could not be replace by any other string
```
