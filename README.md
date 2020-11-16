![WebDAV](https://raw.githubusercontent.com/perry-mitchell/webdav-client/master/webdav.jpg)

> A WebDAV client written in JavaScript for NodeJS and the browser.

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-client.svg?branch=master)](https://travis-ci.org/perry-mitchell/webdav-client) [![npm version](https://badge.fury.io/js/webdav.svg)](https://www.npmjs.com/package/webdav) [![monthly downloads](https://img.shields.io/npm/dm/webdav.svg)](https://www.npmjs.com/package/webdav) [![total downloads](https://img.shields.io/npm/dt/webdav.svg?label=total%20downloads)](https://www.npmjs.com/package/webdav)

## About

WebDAV is a well-known, stable and highly flexible protocol for interacting with remote filesystems via an API. Being that it is so widespread, many file hosting services such as **Box**, **ownCloud**/**Nextcloud** and **Yandex** use it as a fallback to their other interfaces.

This library provides a **WebDAV client** interface that makes interacting with WebDAV enabled services easy. The API returns promises and resolve with the results. It parses and prepares directory-contents requests for easy consumption, as well as providing methods for fetching things like file stats and quotas.

Please read the [contribution guide](CONTRIBUTING.md) if you plan on making an issue or PR.

### Node support

This library is compatibale with **NodeJS version 10** and above (For version 6/8 support, use versions in the range of `2.*`. For version 4 support, use versions in the range of `1.*`). Version 2.x is now in maintenance mode and will receive no further feature additions. It will receive the odd bug fix when necessary. Version 1.x is no longer supported.

### Usage in the Browser

As of version 3, WebDAV client is now supported in the browser. The compilation settings specify a minimum supported browser version of Internet Explorer 11, however testing in this browser is not performed regularly.

_Although you may choose to transpile this library's default entry point (NodeJS) yourself, it is not advised - use the dedicated web version instead._

You can use the web version via a different entry point:

```javascript
import { createClient } from "webdav/web";
```

The browser version uses a UMD-style module definition, meaning you can simply load the library within your browser using a `<script>` tag. When using this method the library is made available on the window object as such: `window.WebDAV`. For example:

```javascript
const client = window.WebDAV.createClient(/* ... */);
```

**NB:** Streams are not available within the browser, so `createReadStream` and `createWriteStream` are just stubbed. Calling them will throw an exception.

## Installation

Simple install as a dependency using npm:

```
npm install webdav --save
```

## Usage

Usage entails creating a client adapter instance by calling the factory function `createClient`:

```javascript
const { createClient } = require("webdav");

const client = createClient(
    "https://webdav.example.com/marie123",
    {
        username: "marie",
        password: "myS3curePa$$w0rd"
    }
);

// Get directory contents
const directoryItems = await client.getDirectoryContents("/");
// Outputs a structure like:
// [{
//     filename: "/my-file.txt",
//     basename: "my-file.txt",
//     lastmod: "Mon, 10 Oct 2018 23:24:11 GMT",
//     size: 371,
//     type: "file"
// }]
```

Make sure to read the [API documentation](API.md) for more information on the [available adapter methods](API.md#ClientInterface).

### Authentication & Connection

`webdav` uses `Basic` authentication by default, if `username` and `password` are provided (if none are provided, no `Authorization` header is specified). It also supports OAuth tokens and Digest auth.

#### Basic or no authentication

You can use the client without authentication if the server doesn't require it - simply avoid passing any values to `username`, `password`, `token` or `digest` in the config.

To use basic authentication, simply pass a `username` and `password` in the config.

`webdav` also allows for overriding the built in HTTP and HTTPS agents by setting the properties `httpAgent` & `httpsAgent` accordingly. These should be instances of node's [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) and [https.Agent](https://nodejs.org/api/https.html#https_class_https_agent) respectively.

#### OAuth tokens

To use a token to authenticate, simply pass the token data to the `token` field:

```javascript
createClient(
    "https://address.com",
    {
        token: {
            "access_token": "2YotnFZFEjr1zCsicMWpAA",
            "token_type": "example",
            "expires_in": 3600,
            "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
            "example_parameter": "example_value"
        }
    }
);
```

#### Digest authentication

If a server requires digest-based authentication, you can enable this functionality by setting `digest` to true:

```javascript
createClient(
    "https://address.com",
    {
        username: "someUser",
        password: "myS3curePa$$w0rd",
        digest: true
    }
);
```

### Methods

#### copyFile

Copy a file from one remote location to another:

```javascript
await client.copyFile("/sub/item.txt", "/destination/item.txt");
```

#### createDirectory

Create a new directory:

```javascript
await client.createDirectory("/completely/new/path");
```

#### createReadStream

Create a read stream targeted at a remote file:

```javascript
client
    .createReadStream("/video.mp4")
    .pipe(fs.createWriteStream("~/video.np4"));
```

If you want to request only partial data, you can specify the range in the options argument of the method:

```javascript
client
    .createReadStream(
        "/video.mp4", 
        { range: { start: start, end: end } }
    ).pipe(fs.createWriteStream("~/video.np4"));
```

#### createWriteStream

Create a write stream targeted at a remote file:

```javascript
fs.createReadStream("~/Music/song.mp3")
    .pipe(client.createWriteStream("/music/song.mp3"));
```

#### deleteFile

Delete a remote file:

```javascript
await client.deleteFile("/tmp.dat");
```

### exists

Check if a file or directory exists:

```javascript
if (await client.exists("/some/path") === false) {
    await client.createDirectory("/some/path");
}
```

#### getDirectoryContents

Get the contents of a remote directory. Returns an array of [item stats](#item-stat).

```javascript
// Get current directory contents:
const contents = await client.getDirectoryContents("/");
// Get all contents:
const contents = await client.getDirectoryContents("/", { deep: true });
```

Files can be globbed using the `glob` option (processed using [`minimatch`](https://github.com/isaacs/minimatch)). When using a glob pattern it is recommended to fetch `deep` contents:

```javascript
const images = await client.getDirectoryContents("/", { deep: true, glob: "/**/*.{png,jpg,gif}" });
```

#### getFileContents

Fetch the contents of a remote file. Binary contents are returned by default (Buffer):

```javascript
const buff = await client.getFileContents("/package.zip");
```

It is recommended to use streams if the files being transferred are large.

Text files can also be fetched:

```javascript
const str = await client.getFileContents("/config.json", { format: "text" });
```

Specify the `maxContentLength` option to alter the maximum number of bytes the client can receive in the request. **NodeJS only**.

#### getFileDownloadLink

Return a public link where a file can be downloaded. **This exposes authentication details in the URL**.

```javascript
const downloadLink = client.getFileDownloadLink("/image.png");
```

_Not all servers may support this feature. Only Basic authentication and unauthenticated connections support this method._

#### getFileUploadLink

Return a URL for a file upload:

```javascript
const uploadLink = client.getFileUploadLink("/image.png");
```

_See `getFileDownloadLink` for support details._

#### getQuota

Get the quota information for the current account:

```javascript
const quota = await client.getQuota();
// {
//     "used": 1938743,
//     "available": "unlimited"
// }
```

#### moveFile

Move a remote file to another remote location:

```javascript
await client.moveFile("/file1.png", "/file2.png");
```

#### putFileContents

Write data to a remote file:

```javascript
// Write a buffer:
await client.putFileContents("/my/file.jpg", imageBuffer, { overwrite: false });
// Write a text file:
await client.putFileContents("/my/file.txt", str);
```

Specify the `maxBodyLength` option to alter the maximum number of bytes the client can send in the request. **NodeJS only**.

Handling Upload Progress (browsers only):  
*This uses the axios onUploadProgress callback which uses the native XMLHttpRequest [progress event](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onprogress).*

```javascript
// Upload a file and log the progress to the console:
await client.putFileContents("/my/file.jpg", imageFile, { onUploadProgress: progress => {
    console.log(`Uploaded ${progress.loaded} bytes of ${progress.total}`);
} });
```

#### stat

Get a file or directory stat object:

```javascript
const stat = await client.stat("/some/file.tar.gz");
```

Returns an [item stat](#item-stat).

### Custom requests

Custom requests can be made to the attached host:

```javascript
const contents = await client.customRequest("/alrighty.jpg", {
    method: "PROPFIND",
    headers: {
        Accept: "text/plain",
        Depth: 0
    },
    responseType: "text"
});
```

### Returned data structures

#### Directory contents items

Each item returned by `getDirectoryContents` is basically an [item stat](#item-stat). If the `details: true` option is set, each item stat (as mentioned in the stat documentation) will also include the `props` property containing extra properties returned by the server. No particular property in `props`, not its format or value, is guaranteed.

You can request all files in the file-tree (infinite depth) by calling `getDirectoryContents` with the option `deep: true`. All items will be returned in a flat array, where the `filename` will hold the absolute path.

#### Detailed responses

Requests that return results, such as `getDirectoryContents`, `getFileContents`, `getQuota` and `stat`, can be configured to return more detailed information, such as response headers. Pass `{ details: true }` to their options argument to receive an object like the following:

| Property     | Type            | Description                            |
|--------------|-----------------|----------------------------------------|
| data         | *               | The data returned by the procedure. Will be whatever type is returned by calling without `{ details: true }` |
| headers      | Object          | The response headers.                  |        

#### Item stat

Item stats are objects with properties that descibe a file or directory. They resemble the following:

```json
{
    "filename": "/test",
    "basename": "test",
    "lastmod": "Tue, 05 Apr 2016 14:39:18 GMT",
    "size": 0,
    "type": "directory",
    "etag": null
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
    "mime": "image/jpeg",
    "etag": "33a728c7f288ede1fecc90ac6a10e062"
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
| etag          | String / null | When supported | [ETag](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag) of the file |
| props         | Object  | `details: true` | Props object containing all item properties returned by the server |

## Compatibility
This library has been tested to work with the following WebDAV servers or applications:

 * [ownCloud](https://owncloud.org/) ¹
 * [Nextcloud](https://nextcloud.com/) ¹
 * [Yandex.ru](https://yandex.ru/)
 * [jsDAV](https://github.com/mikedeboer/jsDAV)
 * [webdav-server](https://github.com/OpenMarshal/npm-WebDAV-Server)
 
 ¹ These services will work if CORS is correctly configured to return the proper headers. This may not work by default.

### CORS
CORS is a security enforcement technique employed by browsers to ensure requests are executed to and from expected contexts. It can conflict with this library if the target server doesn't return CORS headers when making requests from a browser. It is your responsibility to handle this.

It is a known issue that ownCloud and Nextcloud servers by default don't return friendly CORS headers, making working with this library within a browser context impossible. You can of course force the addition of CORS headers (Apache or Nginx configs) yourself, but do this at your own risk.
