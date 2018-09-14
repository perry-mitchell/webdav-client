![WebDAV](https://raw.githubusercontent.com/perry-mitchell/webdav-client/master/webdav.jpg)

> A WebDAV client written in JavaScript for NodeJS and the browser.

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-client.svg?branch=master)](https://travis-ci.org/perry-mitchell/webdav-client) [![npm version](https://badge.fury.io/js/webdav.svg)](https://www.npmjs.com/package/webdav) [![monthly downloads](https://img.shields.io/npm/dm/webdav.svg)](https://www.npmjs.com/package/webdav)

## About
This client was branched from [webdav-fs](https://github.com/perry-mitchell/webdav-fs) as the core functionality deserved its own repository. As **webdav-fs**' API was designed to resemble NodeJS' fs API, little could be done to improve the adapter interface for regular use.

This WebDAV client library is designed to provide an improved API for low-level WebDAV integration. This client uses `window.fetch` when available in the browser.

Please read our [contribution guide](CONTRIBUTING.md) if you plan on making an issue or PR.

## Installation
To install for use with NodeJS, execute the following shell command:

```shell
npm install webdav --save
```

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

### Authentication
`webdav` uses `Basic` authentication by default, if `username` and `password` are provided (if none are provided, no `Authorization` header is specified). It also supports OAuth tokens - simply pass the token data to the `username` field:

```javascript
createClient(
    "https://address.com",
    {
        "access_token": "2YotnFZFEjr1zCsicMWpAA",
        "token_type": "example",
        "expires_in": 3600,
        "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
        "example_parameter": "example_value"
    }
);
```

### Adapter methods
These methods can be called on the object returned from the main factory.

#### copyFile(remotePath, targetPath _[, options]_)
Copy a file or directory from one path to another.

#### createDirectory(remotePath _[, options]_)
Create a new directory at the remote path.

#### createReadStream(remotePath _[, options]_)
Creates a readable stream on the remote path.

Returns a readable stream instance.

##### options.range
Optionally request part of the remote file by specifying the `start` and `end` byte positions. The `end` byte position is optional and the rest of the file from `start` onwards will be streamed.

```javascript
var stream = client.createReadStream("/test/image.png", {
    range: { start: 0, end: 499 } // first 500 bytes
});
```

#### createWriteStream(remotePath _[, options]_)
Creates a writeable stream to a remote path.

Returns a writeable stream instance. Note that the actual stream returned is a [Node `PassThroughStream`](PassThroughStream) instance, not a `stream.Writable`.

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
    .getFileContents("/doc.txt", { format: "text" })
    .then(function(text) {
        console.log(text);
    });
```

**Important**: When running on Node, `node-fetch` is used as the default fetch library. `node-fetch` provides the `.buffer()` method for responses, which returns a `Buffer` instance, but other libraries (and standard `fetch`) do not. When the `buffer` method is not available, this library will attempt to use `.arrayBuffer`. It is your responsibility to handle the output and any required conversion. The [`arraybuffer-to-buffer`](https://www.npmjs.com/package/arraybuffer-to-buffer) library makes it easy to convert back to a `Buffer` if you require it.

#### getFileDownloadLink(remotePath _[, options]_)
Get the external download link of a remote file. Only supported for non-authenticated connections or connections using Basic authentication.

**Important note**: This method exposes the username and password **in the URL** - It is not recommended to send or store any output from this function.

#### getQuota(_[options]_)
Get quota information. Returns `null` upon failure or an object like so:

```json
{
    "used": "12842",
    "available": "512482001"
}
```

Both values are provided in bytes in string form. `available` may also be one of the following:

 * `unknown`: The available space is unknown or not yet calculated
 * `unlimited`: The space available is not limited by quotas

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

## Compatibility
This library has been tested to work with the following WebDAV servers or applications:

 * [ownCloud](https://owncloud.org/)
 * [Nextcloud](https://nextcloud.com/)
 * [Yandex.ru](https://yandex.ru/)
 * [jsDAV](https://github.com/mikedeboer/jsDAV)
 * [webdav-server](https://github.com/OpenMarshal/npm-WebDAV-Server)

### Webpack / Browserify
WebDAV-client is browser friendly, after being transpiled. Refer to the use of WebDAV-fs in the [Buttercup mobile compatibility library](https://github.com/buttercup/buttercup-mobile-compat) or the [Buttercup browser extension](https://github.com/buttercup/buttercup-browser-extension) for guidance on preparation for the web.

Please note that it is _not_ the responsibility of this library to be compatible with Webpack or Browserify. Small modifications may be made here to support them, but no guarantees of compatibility are made as there are an almost infinite number of configurations in both systems that could potentially cause issues with this library or a dependency therein.
