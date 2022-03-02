![WebDAV](https://raw.githubusercontent.com/perry-mitchell/webdav-client/master/webdav.jpg)

> A WebDAV client, written in Typescript, for NodeJS and the browser

![build status](https://github.com/perry-mitchell/webdav-client/actions/workflows/test.yml/badge.svg) [![npm version](https://badge.fury.io/js/webdav.svg)](https://www.npmjs.com/package/webdav) [![monthly downloads](https://img.shields.io/npm/dm/webdav.svg)](https://www.npmjs.com/package/webdav) [![total downloads](https://img.shields.io/npm/dt/webdav.svg?label=total%20downloads)](https://www.npmjs.com/package/webdav)

## About

WebDAV is a well-known, stable and highly flexible protocol for interacting with remote filesystems via an API. Being that it is so widespread, many file hosting services such as **Box**, **Nextcloud**/**ownCloud** and **Yandex** use it as a fallback to their primary interfaces.

This library provides a **WebDAV client** interface that makes interacting with WebDAV enabled services easy. The API returns promises and resolve with the results. It parses and prepares directory-contents requests for easy consumption, as well as providing methods for fetching things like file stats and quotas.

This library's motivation is **not** to follow an RFC or to strictly adhere to standard WebDAV interfaces, but to provide an easy-to-consume client API for working with most WebDAV services from Node or the browser.

### Node support

This library is compatible with **NodeJS version 10** and above (For version 6/8 support, use versions in the range of `2.*`. For version 4 support, use versions in the range of `1.*`). Versions 2.x and 1.x are no longer supported, so use them at your own risk. Version 3.x is deprecated and may receive the odd bugfix.

### Browser support

This WebDAV client is supported in the browser is of version 3. The compilation settings specify a minimum supported browser version of Internet Explorer 11, however testing in this browser is not performed regularly.

_Although you may choose to transpile this library's default entry point (NodeJS) yourself, it is not advised - use the dedicated web version instead._

You can use the web version via a different entry point:

```typescript
import { createClient } from "webdav/web";
```

The browser version uses a UMD-style module definition, meaning you can simply load the library within your browser using a `<script>` tag. When using this method the library is made available on the window object as such: `window.WebDAV`. For example:

```javascript
const client = window.WebDAV.createClient(/* ... */);
```

**NB:** Streams are not available within the browser, so `createReadStream` and `createWriteStream` are just stubbed. Calling them will throw an exception.

### Types

Typescript types are exported with this library for the Node build. All of the types can also be directly imported from the module:

```typescript
import { AuthType, createClient } from "webdav";

const client = createClient("https://some-server.org", {
    authType: AuthType.Digest,
    username: "user",
    password: "pass"
});
```

## Installation

Simple install as a dependency using npm:

```
npm install webdav --save
```

## Usage

Usage entails creating a client adapter instance by calling the factory function `createClient`:

```typescript
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

### Authentication & Connection

The WebDAV client automatically detects which authentication to use, between `AuthType.None` and `AuthType.Password`, if no `authType` configuration parameter is provided. For `AuthType.Token` or `AuthType.Digest`, you must specify it explicitly.

Setting the `authType` will automatically manage the `Authorization` header when connecting.

#### Basic/no authentication

You can use the client without authentication if the server doesn't require it - simply avoid passing any values to `username`, `password` in the config.

To use basic authentication, simply pass a `username` and `password` in the config.

This library also allows for overriding the built in HTTP and HTTPS agents by setting the properties `httpAgent` & `httpsAgent` accordingly. These should be instances of node's [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) and [https.Agent](https://nodejs.org/api/https.html#https_class_https_agent) respectively.

#### OAuth tokens

To use a token to authenticate, pass the token data to the `token` field and specify the `authType`:

```typescript
createClient(
    "https://address.com",
    {
        authType: AuthType.Token,
        token: {
            access_token: "2YotnFZFEjr1zCsicMWpAA",
            token_type: "example",
            expires_in: 3600,
            refresh_token: "tGzv3JOkF0XG5Qx2TlKWIA",
            example_parameter: "example_value"
        }
    }
);
```

#### Digest authentication

If a server requires digest-based authentication, you can enable this functionality by the `authType` configuration parameter, as well as providing a `username` and `password`:

```typescript
createClient(
    "https://address.com",
    {
        authType: AuthType.Digest,
        username: "someUser",
        password: "myS3curePa$$w0rd"
    }
);
```

### Client configuration

The `createClient` method takes a WebDAV service URL, and a configuration options parameter.

The available configuration options are as follows:

| Option        | Default       | Description                                       |
|---------------|---------------|---------------------------------------------------|
| `authType`    | `null`        | The authentication type to use. If not provided, defaults to trying to detect based upon whether `username` and `password` were provided. |
| `headers`     | `{}`          | Additional headers provided to all requests. Headers provided here are overridden by method-specific headers, including `Authorization`. |
| `httpAgent`   | _None_        | HTTP agent instance. Available only in Node. See [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent). |
| `httpsAgent`  | _None_        | HTTPS agent instance. Available only in Node. See [https.Agent](https://nodejs.org/api/https.html#https_class_https_agent). |
| `maxBodyLength` | _None_      | Maximum body length allowed for sending, in bytes. |
| `maxContentLength` | _None_   | Maximum content length allowed for receiving, in bytes. |
| `password`    | _None_        | Password for authentication.                      |
| `token`       | _None_        | Token object for authentication.                  |
| `username`    | _None_        | Username for authentication.                      |
| `withCredentials` | _None_    | Credentials inclusion setting for Axios.          |

### Client methods

The `WebDAVClient` interface type contains all the methods and signatures for the WebDAV client instance.

#### copyFile

Copy a file from one location to another.

```typescript
await client.copyFile(
    "/images/test.jpg",
    "/public/img/test.jpg"
);
```

```typescript
(filename: string, destination: string, options?: WebDAVMethodOptions) => Promise<void>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The source filename.                          |
| `destination`     | Yes       | The destination filename.                     |
| `options`         | No        | [Method options](#method-options).            |

#### createDirectory

Create a new directory.

```typescript
await client.createDirectory("/data/system/storage");
```

```typescript
(path: string, options?: CreateDirectoryOptions) => Promise<void>
```

| Argument              | Required  | Description                                   |
|-----------------------|-----------|-----------------------------------------------|
| `path`                | Yes       | The path to create.                           |
| `options`             | No        | Create directory options.                     |
| `options.recursive`   | No        | Recursively create directories if they do not exist. |

_`options` extends [method options](#method-options)._

##### Recursive creation

Recursive directory creation is expensive request-wise. Multiple `stat` requests are made (totalling the depth of the path that exists, +1) to detect what parts of the path already exist, until finding a segment that doesn't exist - where it then only requests the _creation_ method.

For example, a recursive call to create a path `/a/b/c/d/e`, where `/a/b` already exists, will result in **3** `stat` requests (for `/a`, `/a/b` and `/a/b/c`) and **3** `createDirectory` requests (for `/a/b/c`, `/a/b/c/d` and `/a/b/c/d/e`).

#### createReadStream

Synchronously create a readable stream for a remote file.

_Note that although a stream is returned instantly, the connection and fetching of the file is still performed asynchronously in the background. There will be some delay before the stream begins receiving data._

```typescript
client
    .createReadStream("/video.mp4")
    .pipe(fs.createWriteStream("~/video.mp4"));
```

If you want to stream only part of the file, you can specify the `range` in the options argument:

```typescript
client
    .createReadStream(
        "/video.mp4", 
        { range: { start: 0, end: 1024 } }
    ).pipe(fs.createWriteStream("~/video.mp4"));
```

```typescript
(filename: string, options?: CreateReadStreamOptions) => Stream.Readable
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `callback`        | No        | Callback to fire with the response of the request. |
| `filename`        | Yes       | The remote file to stream.                    |
| `options`         | No        | Read stream options.                          |
| `options.range`   | No        | Stream range configuration.                   |
| `options.range.start` | Yes   | Byte-position for the start of the stream.    |
| `options.range.end` | No      | Byte-position for the end of the stream.      |

_`options` extends [method options](#method-options)._

#### createWriteStream

Create a write stream targeted at a remote file.

_Note that although a stream is returned instantly, the connection and writing to the remote file is still performed asynchronously in the background. There will be some delay before the stream begins piping data._

```typescript
fs
    .createReadStream("~/Music/song.mp3")
    .pipe(client.createWriteStream("/music/song.mp3"));
```

```typescript
(filename: string, options?: CreateWriteStreamOptions, callback?: CreateWriteStreamCallback) => Stream.Writable
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The remote file to stream.                    |
| `options`         | No        | Write stream options.                         |
| `options.overwrite` | No      | Whether or not to overwrite the remote file if it already exists. Defaults to `true`. |
| `callback`        | No        | Callback to fire once the connection has been made and streaming has started. Callback is called with the response of the request. |

_`options` extends [method options](#method-options)._

#### customRequest

Custom requests can be made to the attached host by calling `customRequest`. Custom requests provide the boilerplate authentication and other request options used internally within the client.

```typescript
const resp: Response = await this.client.customRequest("/alrighty.jpg", {
    method: "PROPFIND",
    headers: {
        Accept: "text/plain",
        Depth: "0"
    },
    responseType: "text"
});
const result: DAVResult = await parseXML(resp.data);
const stat: FileStat = parseStat(result, "/alrighty.jpg", false);
```

```typescript
(path: string, requestOptions: RequestOptionsCustom) => Promise<Response>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | The path to make a custom request against.    |
| `requestOptions`  | Yes       | Request options - required parameters such as `url`, `method` etc. - Refer to the `RequestOptionsCustom` type definition. |

_The request options parameter **does not** extend [method options](#method-options) as things like `headers` can already be specified._

#### deleteFile

Delete a remote file.

```typescript
await client.deleteFile("/tmp.dat");
```

```typescript
(filename: string, options?: WebDAVMethodOptions) => Promise<void>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The file to delete.                           |
| `options`         | No        | [Method options](#method-options).            |

#### exists

Check if a file or directory exists.

```typescript
if (await client.exists("/some/path") === false) {
    await client.createDirectory("/some/path");
}
```

```typescript
(path: string, options?: WebDAVMethodOptions) => Promise<boolean>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | The remote path to check.                     |
| `options`         | No        | [Method options](#method-options).            |

#### getDirectoryContents

Get the contents of a remote directory. Returns an array of [item stats](#item-stats).

```typescript
// Get current directory contents:
const contents = await client.getDirectoryContents("/");
// Get all contents:
const contents = await client.getDirectoryContents("/", { deep: true });
```

Files can be globbed using the `glob` option (processed using [`minimatch`](https://github.com/isaacs/minimatch)). When using a glob pattern it is recommended to fetch `deep` contents:

```typescript
const images = await client.getDirectoryContents("/", { deep: true, glob: "/**/*.{png,jpg,gif}" });
```

```typescript
(path: string, options?: GetDirectoryContentsOptions) => Promise<Array<FileStat> | ResponseDataDetailed<Array<FileStat>>>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | The path to fetch the contents of.            |
| `options`         | No        | Configuration options.                        |
| `options.deep`    | No        | Fetch deep results (recursive). Defaults to `false`. |
| `options.details` | No        | Fetch detailed results (item stats, headers). Defaults to `false`. |
| `options.glob`    | No        | Glob string for matching filenames. Not set by default. |

_`options` extends [method options](#method-options)._

#### getFileContents

Fetch the contents of a remote file. Binary contents are returned by default (`Buffer`):

```typescript
const buff: Buffer = await client.getFileContents("/package.zip");
```

_It is recommended to use streams if the files being transferred are large._

Text files can also be fetched:

```typescript
const str: string = await client.getFileContents("/config.json", { format: "text" });
```

Specify the `maxContentLength` option to alter the maximum number of bytes the client can receive in the request (**NodeJS only**).

```typescript
(filename: string, options?: GetFileContentsOptions) => Promise<BufferLike | string | ResponseDataDetailed<BufferLike | string>>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The file to fetch the contents of.            |
| `options`         | No        | Configuration options.                        |
| `options.details` | No        | Fetch detailed results (additional headers). Defaults to `false`. |
| `options.format`  | No        | Whether to fetch binary ("binary") data or textual ("text"). Defaults to "binary". |

_`options` extends [method options](#method-options)._

##### Download progress

You can calculate the progress of the download by using `onDownloadProgress`:

```typescript
import { ProgressEvent } from "webdav";

await client.getFileContents("/package.zip", {
    onDownloadProgress: (progressEvent: ProgressEvent) => {
        // {
        //     total: 12345600,
        //     loaded: 54023
        // }
    }
});
```

#### getFileDownloadLink

Generate a public link where a file can be downloaded. This method is synchronous. **Exposes authentication details in the URL**.

_Not all servers may support this feature. Only Basic authentication and unauthenticated connections support this method._

```typescript
const downloadLink: string = client.getFileDownloadLink("/image.png");
```

```typescript
(filename: string) => string
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The remote file to generate a download link for. |

#### getFileUploadLink

Generate a URL for a file upload. This method is synchronous. **Exposes authentication details in the URL**.

```typescript
const uploadLink: string = client.getFileUploadLink("/image.png");
```

```typescript
(filename: string) => string
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The remote file to generate an upload link for. |

#### getQuota

Get the quota information for the current account:

```typescript
const quota: DiskQuota = await client.getQuota();
// {
//     "used": 1938743,
//     "available": "unlimited"
// }
```

```typescript
(options?: GetQuotaOptions) => Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `options`         | No        | Configuration options.                        |
| `options.details` | No        | Return detailed results (headers etc.). Defaults to `false`. |
| `options.path`    | No        | Path used to make the quota request.          |

_`options` extends [method options](#method-options)._

#### lock

Lock a remote resource (using a **write** lock).

```typescript
const lock = await client.lock("/file.doc");

// Later
await client.unlock("/file.doc", lock.token);
```

```typescript
(path: string, options?: LockOptions) => Promise<LockResponse>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | The path to lock.                             |
| `options`         | No        | Configuration options.                        |
| `options.timeout` | No        | WebDAV lock requested timeout. See the [WebDAV `Timeout` header documentation](https://docs.microsoft.com/en-us/previous-versions/office/developer/exchange-server-2003/aa143141(v=exchg.65)). |
| `options.refreshToken` | No   | Previous valid lock token that should be refreshed. |

_`options` extends [method options](#method-options)._

#### moveFile

Move a file to another location.

```typescript
await client.moveFile("/file1.png", "/file2.png");
```

```typescript
(filename: string, destinationFilename: string, options?: WebDAVMethodOptions) => Promise<void>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | File to move.                                 |
| `destinationFilename` | Yes   | Destination filename.                         |
| `options`         | No        | [Method options](#method-options).            |

#### putFileContents

Write data to a remote file. Returns `false` when file was not written (eg. `{ overwrite: false }` and file exists), and `true` otherwise.

```typescript
// Write a buffer:
await client.putFileContents("/my/file.jpg", imageBuffer, { overwrite: false });
// Write a text file:
await client.putFileContents("/my/file.txt", str);
```

Specify the `maxBodyLength` option to alter the maximum number of bytes the client can send in the request (**NodeJS only**). When using `{ overwrite: false }`, responses with status `412` are caught and no error is thrown.

Handling Upload Progress (browsers only):
*This uses the axios onUploadProgress callback which uses the native XMLHttpRequest [progress event](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequestEventTarget/onprogress).*

```typescript
// Upload a file and log the progress to the console:
await client.putFileContents("/my/file.jpg", imageFile, { onUploadProgress: progress => {
    console.log(`Uploaded ${progress.loaded} bytes of ${progress.total}`);
} });
```

```typescript
(filename: string, data: string | BufferLike | Stream.Readable, options?: PutFileContentsOptions) => Promise<boolean>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | File to write to.                             |
| `data`            | Yes       | The data to write. Can be a string, buffer or a readable stream. |
| `options`         | No        | Configuration options.                        |
| `options.contentLength` | No  | Data content length override. Either a boolean (`true` (**default**) = calculate, `false` = don't set) or a number indicating the exact byte length of the file. |
| `options.overwrite` | No      | Whether or not to override the remote file if it exists. Defaults to `true`. |

_`options` extends [method options](#method-options)._

#### stat

Get a file or directory stat object. Returns an [item stat](#item-stats).

```typescript
const stat: FileStat = await client.stat("/some/file.tar.gz");
```

```typescript
(path: string, options?: StatOptions) => Promise<FileStat | ResponseDataDetailed<FileStat>>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | Remote path to stat.                          |
| `options`         | No        | Configuration options.                        |
| `options.details` | No        | Return detailed results (headers etc.). Defaults to `false`. |

_`options` extends [method options](#method-options)._

#### unlock

Unlock a locked resource using a token.

```typescript
await client.unlock("/file.doc", lock.token);
```

```typescript
(path: string, token:string, options?: WebDAVMethodOptions) => Promise<void>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | Remote path to unlock.                        |
| `token`           | Yes       | Token string from a previous lock request.    |
| `options`         | No        | Configuration options.                        |

_`options` extends [method options](#method-options)._

##### Custom properties

For requests like `stat`, which use the `PROPFIND` method under the hood, it is possible to provide a custom request body to the method so that the server may respond with additional/different data. Overriding of the body can be performed by setting the `data` property in the [method options](#method-options).

### Method options

Most WebDAV methods extend `WebDAVMethodOptions`, which allow setting things like custom headers.

| Option            | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `data`            | No        | Optional body/data value to send in the request. This overrides the original body of the request, if applicable. |
| `headers`         | No        | Optional headers object to apply to the request. These headers override all others, so be careful. |
| `signal`          | No        | Instance of [`AbortSignal`](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal), for aborting requests. |

### Common data structures

#### Item stats

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


#### Detailed responses

Requests that return results, such as `getDirectoryContents`, `getFileContents`, `getQuota` and `stat`, can be configured to return more detailed information, such as response headers. Pass `{ details: true }` to their options argument to receive an object like the following:

| Property     | Type            | Description                            |
|--------------|-----------------|----------------------------------------|
| data         | *               | The data returned by the procedure. Will be whatever type is returned by calling without `{ details: true }` |
| headers      | Object          | The response headers.                  |
| status       | Number          | The numeric status code.               |
| statusText   | String          | The status text.                       |

### CORS
CORS is a security enforcement technique employed by browsers to ensure requests are executed to and from expected contexts. It can conflict with this library if the target server doesn't return CORS headers when making requests from a browser. It is your responsibility to handle this.

It is a known issue that ownCloud and Nextcloud servers by default don't return friendly CORS headers, making working with this library within a browser context impossible. You can of course force the addition of CORS headers (Apache or Nginx configs) yourself, but do this at your own risk.

## Projects using this WebDAV client

[Buttercup Password Manager](https://github.com/buttercup), [Nextcloud Server](https://github.com/nextcloud/server), [Nextcloud Photos](https://github.com/nextcloud/photos), [ownCloud SDK](https://github.com/owncloud/owncloud-sdk), [React OxIDE](https://github.com/bootrino/reactoxide), [BackItUp](https://github.com/simatec/ioBroker.backitup)
