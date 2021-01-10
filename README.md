![WebDAV](https://raw.githubusercontent.com/perry-mitchell/webdav-client/master/webdav.jpg)

> A WebDAV client, written in Typescript, for NodeJS and the browser

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-client.svg?branch=master)](https://travis-ci.org/perry-mitchell/webdav-client) [![npm version](https://badge.fury.io/js/webdav.svg)](https://www.npmjs.com/package/webdav) [![monthly downloads](https://img.shields.io/npm/dm/webdav.svg)](https://www.npmjs.com/package/webdav) [![total downloads](https://img.shields.io/npm/dt/webdav.svg?label=total%20downloads)](https://www.npmjs.com/package/webdav)

## About

WebDAV is a well-known, stable and highly flexible protocol for interacting with remote filesystems via an API. Being that it is so widespread, many file hosting services such as **Box**, **Nextcloud**/**ownCloud** and **Yandex** use it as a fallback to their primary interfaces.

This library provides a **WebDAV client** interface that makes interacting with WebDAV enabled services easy. The API returns promises and resolve with the results. It parses and prepares directory-contents requests for easy consumption, as well as providing methods for fetching things like file stats and quotas.

### Node support

This library is compatibale with **NodeJS version 10** and above (For version 6/8 support, use versions in the range of `2.*`. For version 4 support, use versions in the range of `1.*`). Versions 2.x and 1.x are no longer supported, so use them at your own risk.

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

### Client Methods

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
(filename: string, destination: string) => Promise<void>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The source filename.                          |
| `destination`     | Yes       | The destination filename.                     |

#### createDirectory

Create a new directory.

```typescript
await client.createDirectory("/data/system/storage");
```

```typescript
(path: string) => Promise<void>
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `path`            | Yes       | The path to create.                           |

#### createReadStream

Synchronously create a readable stream for a remote file.

_Note that although a stream is returned instantly, the connection and fetching of the file is still performed asynchronously in the background. There will be some delay before the stream begins receiving data._

```typescript
client
    .createReadStream("/video.mp4")
    .pipe(fs.createWriteStream("~/video.mp4"));
```

```typescript
(filename: string, options?: CreateReadStreamOptions) => Stream.Readable
```

| Argument          | Required  | Description                                   |
|-------------------|-----------|-----------------------------------------------|
| `filename`        | Yes       | The remote file to stream.                    |
| `options`         | No        | Read stream options.                          |
| `options.range`   | No        | Stream range configuration.                   |
| `options.range.start` | Yes   | Byte-position for the start of the stream.    |
| `options.range.end` | No      | Byte-position for the end of the stream.      |

