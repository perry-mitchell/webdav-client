## Modules

<dl>
<dt><a href="#module_WebDAV">WebDAV</a> ⇒ <code><a href="#ClientInterface">ClientInterface</a></code></dt>
<dd><p>Create a client adapter</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#encodePath">encodePath(path)</a> ⇒ <code>String</code></dt>
<dd><p>Encode a path for use with WebDAV servers</p>
</dd>
<dt><a href="#setFetchMethod">setFetchMethod(fn)</a></dt>
<dd><p>Set the fetch method to use when making requests
Defaults to <code>node-fetch</code>. Setting it to <code>null</code> will reset it to <code>node-fetch</code>.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ClientInterface">ClientInterface</a> : <code>Object</code></dt>
<dd><p>Client adapter</p>
</dd>
<dt><a href="#OptionsWithHeaders">OptionsWithHeaders</a> : <code>Object</code></dt>
<dd><p>Options with header object</p>
</dd>
<dt><a href="#PutOptions">PutOptions</a> : <code><a href="#OptionsWithHeaders">OptionsWithHeaders</a></code></dt>
<dd><p>Options for creating a resource</p>
</dd>
</dl>

<a name="module_WebDAV"></a>

## WebDAV ⇒ [<code>ClientInterface</code>](#ClientInterface)
Create a client adapter

**Returns**: [<code>ClientInterface</code>](#ClientInterface) - A new client interface instance  

| Param | Type | Description |
| --- | --- | --- |
| remoteURL | <code>String</code> | The remote address of the webdav server |
| [username] | <code>String</code> | Optional username for authentication |
| [password] | <code>String</code> | Optional password for authentication |

**Example**  
```js
const createClient = require("webdav");
 const client = createClient(url, username, password);
 client
     .getDirectoryContents("/")
     .then(contents => {
         console.log(contents);
     });
```
**Example**  
```js
const createClient = require("webdav");
 const client = createClient(url, {token_type: 'Bearer', access_token: 'tokenvalue'});
 client
     .getDirectoryContents("/")
     .then(contents => {
         console.log(contents);
     });
```
<a name="encodePath"></a>

## encodePath(path) ⇒ <code>String</code>
Encode a path for use with WebDAV servers

**Kind**: global function  
**Returns**: <code>String</code> - The encoded path (separators protected)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | The path to encode |

<a name="setFetchMethod"></a>

## setFetchMethod(fn)
Set the fetch method to use when making requests
Defaults to `node-fetch`. Setting it to `null` will reset it to `node-fetch`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to use - should perform like `fetch`. |

**Example**  
```js
const createClient = require("webdav");
 createClient.setFetchMethod(window.fetch);
```
<a name="ClientInterface"></a>

## ClientInterface : <code>Object</code>
Client adapter

**Kind**: global typedef  

* [ClientInterface](#ClientInterface) : <code>Object</code>
    * [.copyFile(remotePath, targetRemotePath, [options])](#ClientInterface.copyFile) ⇒ <code>Promise</code>
    * [.createDirectory(dirPath, [options])](#ClientInterface.createDirectory) ⇒ <code>Promise</code>
    * [.createReadStream(remoteFilename, [options])](#ClientInterface.createReadStream) ⇒ <code>Readable</code>
    * [.createWriteStream(remoteFilename, [options])](#ClientInterface.createWriteStream) ⇒ <code>Writeable</code>
    * [.deleteFile(remotePath, [options])](#ClientInterface.deleteFile) ⇒ <code>Promise</code>
    * [.getDirectoryContents(remotePath, [options])](#ClientInterface.getDirectoryContents) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [.getFileContents(remoteFilename, [options])](#ClientInterface.getFileContents) ⇒ <code>Promise.&lt;(Buffer\|String)&gt;</code>
    * [.getQuota([options])](#ClientInterface.getQuota) ⇒ <code>null</code> \| <code>Object</code>
    * [.moveFile(remotePath, targetRemotePath, [options])](#ClientInterface.moveFile) ⇒ <code>Promise</code>
    * [.putFileContents(remoteFilename, data, [options])](#ClientInterface.putFileContents) ⇒ <code>Promise</code>
    * [.stat(remotePath, [options])](#ClientInterface.stat) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="ClientInterface.copyFile"></a>

### ClientInterface.copyFile(remotePath, targetRemotePath, [options]) ⇒ <code>Promise</code>
Copy a remote item to another path

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves once the request has completed  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote item path |
| targetRemotePath | <code>String</code> | The path file will be copied to |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | Options for the request |

<a name="ClientInterface.createDirectory"></a>

### ClientInterface.createDirectory(dirPath, [options]) ⇒ <code>Promise</code>
Create a directory

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves when the remote path has been created  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>String</code> | The path to create |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | Options for the request |

<a name="ClientInterface.createReadStream"></a>

### ClientInterface.createReadStream(remoteFilename, [options]) ⇒ <code>Readable</code>
Create a readable stream of a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Readable</code> - A readable stream  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to stream |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | Options for the request |

<a name="ClientInterface.createWriteStream"></a>

### ClientInterface.createWriteStream(remoteFilename, [options]) ⇒ <code>Writeable</code>
Create a writeable stream to a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Writeable</code> - A writeable stream  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to write to |
| [options] | [<code>PutOptions</code>](#PutOptions) | Options for the request |

<a name="ClientInterface.deleteFile"></a>

### ClientInterface.deleteFile(remotePath, [options]) ⇒ <code>Promise</code>
Delete a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves when the remote file as been deleted  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote path to delete |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | The options for the request |

<a name="ClientInterface.getDirectoryContents"></a>

### ClientInterface.getDirectoryContents(remotePath, [options]) ⇒ <code>Promise.&lt;Array&gt;</code>
Get the contents of a remote directory

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - A promise that resolves with an array of remote item stats  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The path to fetch the contents of |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | Options for the remote the request |

<a name="ClientInterface.getFileContents"></a>

### ClientInterface.getFileContents(remoteFilename, [options]) ⇒ <code>Promise.&lt;(Buffer\|String)&gt;</code>
Get the contents of a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise.&lt;(Buffer\|String)&gt;</code> - A promise that resolves with the contents of the remote file  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to fetch |
| [options] | <code>OptionsHeadersAndFormat</code> | Options for the request |

<a name="ClientInterface.getQuota"></a>

### ClientInterface.getQuota([options]) ⇒ <code>null</code> \| <code>Object</code>
Get quota information

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>null</code> \| <code>Object</code> - Returns null if failed, or an object with `used` and `available`  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>OptionsHeadersAndFormat</code> | Options for the request |

<a name="ClientInterface.moveFile"></a>

### ClientInterface.moveFile(remotePath, targetRemotePath, [options]) ⇒ <code>Promise</code>
Move a remote item to another path

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves once the request has completed  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote item path |
| targetRemotePath | <code>String</code> | The new path after moving |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | Options for the request |

<a name="ClientInterface.putFileContents"></a>

### ClientInterface.putFileContents(remoteFilename, data, [options]) ⇒ <code>Promise</code>
Write contents to a remote file path

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves once the contents have been written  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The path of the remote file |
| data | <code>String</code> \| <code>Buffer</code> | The data to write |
| [options] | [<code>PutOptions</code>](#PutOptions) | The options for the request |

<a name="ClientInterface.stat"></a>

### ClientInterface.stat(remotePath, [options]) ⇒ <code>Promise.&lt;Object&gt;</code>
Stat a remote object

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with the stat data  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The path of the item |
| [options] | [<code>OptionsWithHeaders</code>](#OptionsWithHeaders) | Options for the request |

<a name="OptionsWithHeaders"></a>

## OptionsWithHeaders : <code>Object</code>
Options with header object

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| headers | <code>Object</code> | Headers key-value list |

<a name="PutOptions"></a>

## PutOptions : [<code>OptionsWithHeaders</code>](#OptionsWithHeaders)
Options for creating a resource

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [overwrite] | <code>Boolean</code> | Whether or not to overwrite existing files (default: true) |

