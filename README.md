![WebDAV](https://raw.githubusercontent.com/perry-mitchell/webdav-client/master/webdav.jpg)

> A WebDAV client written in JavaScript for NodeJS and the browser.

[![Build Status](https://travis-ci.org/perry-mitchell/webdav-client.svg?branch=master)](https://travis-ci.org/perry-mitchell/webdav-client) [![npm version](https://badge.fury.io/js/webdav.svg)](https://www.npmjs.com/package/webdav) [![monthly downloads](https://img.shields.io/npm/dm/webdav.svg)](https://www.npmjs.com/package/webdav)

## About

WebDAV is a well-known, stable and highly flexible protocol for interacting with remote filesystems via an API. Being that it is so widespread, many file hosting services such as **Box**, **ownCloud**/**Nextcloud** and **Yandex** use it as a fallback to their other interfaces.

This library provides a **WebDAV client** interface that makes interacting with WebDAV enabled services easy. The API returns promises and resolve with the results. It parses and prepares directory-contents requests for easy consumption, as well as providing methods for fetching things like file stats and quotas.

This library is compatibale with NodeJS version 6 and above (for version 4 support, use versions in the range of `1.*`). Version 1.x is now in maintenance mode and will receive no further feature additions. It will receive the odd bug fix when necessary.

Please read the [contribution guide](CONTRIBUTING.md) if you plan on making an issue or PR.

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

`webdav` uses `Basic` authentication by default, if `username` and `password` are provided (if none are provided, no `Authorization` header is specified). It also supports OAuth tokens - simply pass the token data to the `token` field:

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

`webdav` also allows for overriding the built in HTTP and HTTPS agents by setting the properties `httpAgent` & `httpsAgent` accordingly. These should be instances of node's [http.Agent](https://nodejs.org/api/http.html#http_class_http_agent) and [https.Agent](https://nodejs.org/api/https.html#https_class_https_agent) respectively.

### Returned data structures

#### Directory contents items

Each item returned by `getDirectoryContents` is basically an [item stat](#item-stat). If the `details: true` option is set, each item stat (as mentioned in the stat documentation) will also include the `props` property containing extra properties returned by the server. No particular property in `props`, not its format or value, is guaranteed.

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

 * [ownCloud](https://owncloud.org/)
 * [Nextcloud](https://nextcloud.com/)
 * [Yandex.ru](https://yandex.ru/)
 * [jsDAV](https://github.com/mikedeboer/jsDAV)
 * [webdav-server](https://github.com/OpenMarshal/npm-WebDAV-Server)

### CORS
CORS is a security enforcement technique employed by browsers to ensure requests are executed to and from expected contexts. It can conflict with this library if the target server doesn't return CORS headers when making requests from a browser. It is your responsibility to handle this.

It is a known issue that ownCloud and Nextcloud servers by default don't return friendly CORS headers, making working with this library within a browser context impossible. You can of course force the addition of CORS headers (Apache or Nginx configs) yourself, but do this at your own risk.
