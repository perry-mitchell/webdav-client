# WebDAV client
A WebDAV client written in JavaScript for NodeJS.

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-client.svg?branch=master)](https://travis-ci.org/perry-mitchell/webdav-client)

[![NPM](https://nodei.co/npm/webdav.png?downloads=true&downloadRank=true&stars=true)](https://www.npmjs.com/package/webdav) [![NPM](https://nodei.co/npm-dl/webdav.png?months=6&height=2)](https://www.npmjs.com/package/webdav)

## About
This client was branched from [webdav-fs](https://github.com/perry-mitchell/webdav-fs) as the core functionality deserved its own repository. As **webdav-fs**' API was designed to resemble NodeJS' fs API, little could be done to improve the adapter interface for regular use.

This WebDAV client library is designed to provide an improved API for low-level WebDAV integration. This client uses `window.fetch` when available in the browser.

## Usage
Usage is very simple ([API](API.md)) - the main exported object is a factory to create adapter instances:

```js
var createClient = require("webdav");

var client = createClient(
    "https://webdav-server.org/remote.php/webdav",
    "username",
    "password"
);

client
    .getDirectoryContents("/")
    .then(function(contents) {
        console.log(JSON.stringify(contents, undefined, 4));
    });
```

Each method returns a `Promise`.

### Adapter methods
These methods can be called on the object returned from the main factory.

#### createDirectory(remotePath _[, options]_)
Create a new directory at the remote path.

#### createReadStream(remotePath _[, options]_)
Creates a readable stream on the remote path. Options is the same format as `getReadStream`.

Returns a readable stream instance.

#### deleteFile(remotePath _[, options]_)
Delete a file or directory at `remotePath`.

#### getDirectoryContents(remotePath _[, options]_)
Get an array of items within a directory. `remotePath` is a string that begins with a forward-slash and indicates the remote directory to get the contents of.

```js
client
    .getDirectoryContents("/MyFolder")
    .then(function(contents) {
        console.log(JSON.stringify(contents, undefined, 2));
    });
```

The returned value is a Promise, which resolves with an array of [item stat objects](#item-stat).

#### getFileContents(remotePath _[, options]_)
Get the contents of the file at `remotePath` as a `Buffer` or `String`. `format` can either be "binary" or "text", where "binary" is default.

```js
var fs = require("fs");

client
    .getFileContents("/folder/myImage.jpg")
    .then(function(imageData) {
        fs.writeFileSync("./myImage.jpg", imageData);
    });
```

Or with text:

```js
client
    .getFileContents("/doc.txt", "text")
    .then(function(text) {
        console.log(text);
    });
```

#### getFileStream(remotePath _[, options]_)
Get a readable stream on a remote file. Returns a Promise that resolves with a readable stream instance.

_This is the underlying method to `createReadStream` (uses a `PassThrough` stream to delay the data). Due to the requirement of waiting on the request to complete before being able to get the **true** read stream, a Promise is returned that resolves when it becomes available. `createReadStream` simply creates and returns a `PassThrough` stream immediately and writes to it once this method resolves._

```js
var fs = require("fs");

client
    .getFileStream("/test/image.png")
    .then(function(imageStream) {
        imageStream.pipe(fs.createWriteStream("./image.png"));
    });
```

`options` is an object that may look like the following:

```json
{
    "headers": {}
}
```

##### options.range
Optionally request part of the remote file by specifying the `start` and `end` byte positions. The `end` byte position is optional and the rest of the file from `start` onwards will be streamed.

```javascript
var stream = client.getFileStream("/test/image.png", {
    range: { start: 0, end: 499 } // first 500 bytes
});
```

#### moveFile(remotePath, targetPath _[, options]_)
Move a file or directory from `remotePath` to `targetPath`.

```js
// Move a directory
client.moveFile("/some-dir", "/storage/moved-dir");

// Rename a file
client.moveFile("/images/pic.jpg", "/images/profile.jpg");
```

#### putFileContents(remotePath, data _[, options]_)
Put some data in a remote file at `remotePath` from a `Buffer` or `String`. `data` is a `Buffer` or a `String`. `options` has a property called `format` which can be "binary" (default) or "text".

```js
var fs = require("fs");

var imageData = fs.readFileSync("someImage.jpg");

client.putFileContents("/folder/myImage.jpg", imageData, { format: "binary" });
```

```js
client.putFileContents("/example.txt", "some text", { format: "text" });
```

`options`, which is **optional**, can be set to an object like the following:

```json
{
    "format": "binary",
    "headers": {
        "Content-Type": "application/octet-stream"
    },
    "overwrite": true
}
```

> `options.overwrite` (default: `true`), if set to false, will add an additional header which tells the server to abort writing if the target already exists.

#### stat(remotePath _[, options]_)
Get the stat properties of a remote file or directory at `remotePath`. Resolved object is a [item stat object](#item-stat).

### Overriding the built-in fetch function
Under the hood, `webdav-client` uses [`node-fetch`](https://github.com/bitinn/node-fetch) to perform requests. This can be overridden by running the following:

```js
// For example, use the `fetch` method in the browser:
const createWebDAVClient = require("webdav");
createWebDAVClient.setFetchMethod(window.fetch);
```

### Returned data structures

#### Item stat
Item stats are objects with properties that descibe a file or directory. They resemble the following:

```json
{
    "filename": "/test",
    "basename": "test",
    "lastmod": "Tue, 05 Apr 2016 14:39:18 GMT",
    "size": 0,
    "type": "directory"
}
```

or:

```json
{
    "filename": "/image.jpg",
    "basename": "image.jpg",
    "lastmod": "Sun, 13 Mar 2016 04:23:32 GMT",
    "size": 42497,
    "type": "file",
    "mime": "image/jpeg"
}
```

Properties:

| Property name | Type    | Present      | Description                                 |
|---------------|---------|--------------|---------------------------------------------|
| filename      | String  | Always       | File path of the remote item                |
| basename      | String  | Always       | Base filename of the remote item, no path   |
| lastmod       | String  | Always       | Last modification date of the item          |
| size          | Number  | Always       | File size - 0 for directories               |
| type          | String  | Always       | Item type - "file" or "directory"           |
| mime          | String  | Files only   | Mime type - for file items only             |
