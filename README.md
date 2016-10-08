# WebDAV client
A WebDAV client written in JavaScript for NodeJS.

## About
This client was branched from [webdav-fs](https://github.com/perry-mitchell/webdav-fs) as the core functionality deserved its own repository. As **webdav-fs**' API was designed to resemble NodeJS' fs API, little could be done to improve the adapter interface for regular use.

This WebDAV client library is designed to provide an improved API for low-level WebDAV integration.

## Usage
Usage is very simple - the main exported object is a factory to create adapter instances:

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
    })
    .catch(function(err) {
        console.error(err);
    });
```

Each method returns a `Promise`.

### Adapter methods
These methods can be called on the object returned from the main factory.

#### getDirectoryContents(remotePath)
Get an array of items within a directory. `remotePath` is a string that begins with a forward-slash and indicates the remote directory to get the contents of.

```js
client
    .getDirectoryContents("/MyFolder")
    .then(function(contents) {
        console.log(JSON.stringify(contents, undefined, 2));
    })
    .catch(function(err) {
        console.error(err);
    });
```

The returned value is a Promise, which resolves with an array of [item stat objects](#item-stat).

#### getFileContents(remotePath)
Get the contents of the file at `remotePath` as a `Buffer`.

```js
var fs = require("fs");

client
    .getFileContents("/folder/myImage.jpg")
    .then(function(imageData) {
        fs.writeFileSync("./myImage.jpg", imageData);
    })
    .catch(function(err) {
        console.error(err);
    });
```

#### getTextContents(remotePath)
Get the text content of a file at `remotePath`.

```js
client
    .getFileContents("/doc.txt")
    .then(function(text) {
        console.log(text);
    })
    .catch(function(err) {
        console.error(err);
    });
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
