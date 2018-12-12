## Modules

<dl>
<dt><a href="#module_WebDAV">WebDAV</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#getPatcher">getPatcher()</a> ⇒ <code>HotPatcher</code></dt>
<dd><p>Get the HotPatcher instance for patching internal methods</p>
</dd>
<dt><a href="#encodePath">encodePath(path)</a> ⇒ <code>String</code></dt>
<dd><p>Encode a path for use with WebDAV servers</p>
</dd>
<dt><a href="#prepareRequestOptions">prepareRequestOptions(requestOptions, methodOptions)</a></dt>
<dd><p>Process request options before being passed to Axios</p>
</dd>
<dt><a href="#request">request(requestOptions)</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Make a request
This method can be patched by patching or plugging-in to the &quot;request&quot;
item using <a href="https://github.com/perry-mitchell/hot-patcher">HotPatcher</a>.
It uses <a href="https://github.com/axios/axios">Axios</a> by default.</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ClientInterface">ClientInterface</a> : <code>Object</code></dt>
<dd><p>Client adapter</p>
</dd>
<dt><a href="#PutOptions">PutOptions</a> : <code><a href="#UserOptions">UserOptions</a></code></dt>
<dd><p>Options for creating a resource</p>
</dd>
<dt><a href="#OptionsWithFormat">OptionsWithFormat</a> : <code><a href="#UserOptions">UserOptions</a></code></dt>
<dd><p>Options with headers and format</p>
</dd>
<dt><a href="#OptionsForAdvancedResponses">OptionsForAdvancedResponses</a> : <code><a href="#UserOptions">UserOptions</a></code></dt>
<dd><p>Options for methods that resturn responses</p>
</dd>
<dt><a href="#AuthToken">AuthToken</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#CreateClientOptions">CreateClientOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#UserOptions">UserOptions</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#RequestOptions">RequestOptions</a> : <code>Object</code></dt>
<dd></dd>
</dl>

<a name="module_WebDAV"></a>

## WebDAV

* [WebDAV](#module_WebDAV)
    * [.axios](#module_WebDAV.axios) : <code>function</code>
    * [.createClient(remoteURL, [options])](#module_WebDAV.createClient) ⇒ [<code>ClientInterface</code>](#ClientInterface)

<a name="module_WebDAV.axios"></a>

### WebDAV.axios : <code>function</code>
Axios request library

**Kind**: static property of [<code>WebDAV</code>](#module_WebDAV)  
<a name="module_WebDAV.createClient"></a>

### WebDAV.createClient(remoteURL, [options]) ⇒ [<code>ClientInterface</code>](#ClientInterface)
Create a client adapter

**Kind**: static method of [<code>WebDAV</code>](#module_WebDAV)  
**Returns**: [<code>ClientInterface</code>](#ClientInterface) - A new client interface instance  

| Param | Type | Description |
| --- | --- | --- |
| remoteURL | <code>String</code> | The remote address of the webdav server |
| [options] | [<code>CreateClientOptions</code>](#CreateClientOptions) | Client options |

**Example**  
```js
const createClient = require("webdav");
 const client = createClient(url, { username, password });
 client
     .getDirectoryContents("/")
     .then(contents => {
         console.log(contents);
     });
```
**Example**  
```js
const createClient = require("webdav");
 const client = createClient(url, {
     token: { token_type: "Bearer", access_token: "tokenvalue" }
 });
 client
     .getDirectoryContents("/")
     .then(contents => {
         console.log(contents);
     });
```
<a name="getPatcher"></a>

## getPatcher() ⇒ <code>HotPatcher</code>
Get the HotPatcher instance for patching internal methods

**Kind**: global function  
**Returns**: <code>HotPatcher</code> - The internal HotPatcher instance  
<a name="encodePath"></a>

## encodePath(path) ⇒ <code>String</code>
Encode a path for use with WebDAV servers

**Kind**: global function  
**Returns**: <code>String</code> - The encoded path (separators protected)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | The path to encode |

<a name="prepareRequestOptions"></a>

## prepareRequestOptions(requestOptions, methodOptions)
Process request options before being passed to Axios

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| requestOptions | [<code>RequestOptions</code>](#RequestOptions) | The request options object |
| methodOptions | [<code>UserOptions</code>](#UserOptions) | Provided options (external) |

<a name="request"></a>

## request(requestOptions) ⇒ <code>Promise.&lt;Object&gt;</code>
Make a request
This method can be patched by patching or plugging-in to the "request"
item using [HotPatcher](https://github.com/perry-mitchell/hot-patcher).
It uses [Axios](https://github.com/axios/axios) by default.

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with a response object  

| Param | Type | Description |
| --- | --- | --- |
| requestOptions | [<code>RequestOptions</code>](#RequestOptions) | Options for the request |

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
    * [.getFileDownloadLink(remoteFilename, [options])](#ClientInterface.getFileDownloadLink) ⇒ <code>String</code>
    * [.getQuota([options])](#ClientInterface.getQuota) ⇒ <code>null</code> \| <code>Object</code>
    * [.moveFile(remotePath, targetRemotePath, [options])](#ClientInterface.moveFile) ⇒ <code>Promise</code>
    * [.putFileContents(remoteFilename, data, [options])](#ClientInterface.putFileContents) ⇒ <code>Promise</code>
    * [.getFileUploadLink(remoteFilename, [options])](#ClientInterface.getFileUploadLink) ⇒ <code>String</code>
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
| [options] | [<code>UserOptions</code>](#UserOptions) | Options for the request |

**Example**  
```js
await client.copyFile("/photos/pic1.jpg", "/backup/pic1.jpg");
```
<a name="ClientInterface.createDirectory"></a>

### ClientInterface.createDirectory(dirPath, [options]) ⇒ <code>Promise</code>
Create a directory

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves when the remote path has been created  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>String</code> | The path to create |
| [options] | [<code>UserOptions</code>](#UserOptions) | Options for the request |

**Example**  
```js
await client.createDirectory("/my/directory");
```
<a name="ClientInterface.createReadStream"></a>

### ClientInterface.createReadStream(remoteFilename, [options]) ⇒ <code>Readable</code>
Create a readable stream of a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Readable</code> - A readable stream  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to stream |
| [options] | [<code>UserOptions</code>](#UserOptions) | Options for the request |

**Example**  
```js
const remote = client.createReadStream("/data.zip");
     remote.pipe(someWriteStream);
```
<a name="ClientInterface.createWriteStream"></a>

### ClientInterface.createWriteStream(remoteFilename, [options]) ⇒ <code>Writeable</code>
Create a writeable stream to a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Writeable</code> - A writeable stream  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to write to |
| [options] | [<code>PutOptions</code>](#PutOptions) | Options for the request |

**Example**  
```js
const remote = client.createWriteStream("/data.zip");
     fs.createReadStream("~/myData.zip").pipe(remote);
```
<a name="ClientInterface.deleteFile"></a>

### ClientInterface.deleteFile(remotePath, [options]) ⇒ <code>Promise</code>
Delete a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves when the remote file as been deleted  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote path to delete |
| [options] | [<code>UserOptions</code>](#UserOptions) | The options for the request |

**Example**  
```js
await client.deleteFile("/some/file.txt");
```
<a name="ClientInterface.getDirectoryContents"></a>

### ClientInterface.getDirectoryContents(remotePath, [options]) ⇒ <code>Promise.&lt;Array&gt;</code>
Get the contents of a remote directory

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - A promise that resolves with an array of remote item stats  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The path to fetch the contents of |
| [options] | [<code>OptionsForAdvancedResponses</code>](#OptionsForAdvancedResponses) | Options for the remote the request |

**Example**  
```js
const contents = await client.getDirectoryContents("/");
```
<a name="ClientInterface.getFileContents"></a>

### ClientInterface.getFileContents(remoteFilename, [options]) ⇒ <code>Promise.&lt;(Buffer\|String)&gt;</code>
Get the contents of a remote file

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise.&lt;(Buffer\|String)&gt;</code> - A promise that resolves with the contents of the remote file  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to fetch |
| [options] | [<code>OptionsWithFormat</code>](#OptionsWithFormat) | Options for the request |

**Example**  
```js
// Fetching data:
     const buff = await client.getFileContents("/image.png");
     // Fetching text:
     const txt = await client.getFileContents("/list.txt", { format: "text" });
```
<a name="ClientInterface.getFileDownloadLink"></a>

### ClientInterface.getFileDownloadLink(remoteFilename, [options]) ⇒ <code>String</code>
Get the download link of a remote file
Only supported for Basic authentication or unauthenticated connections.

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>String</code> - A download URL  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file url to fetch |
| [options] | [<code>UserOptions</code>](#UserOptions) | Options for the request |

<a name="ClientInterface.getQuota"></a>

### ClientInterface.getQuota([options]) ⇒ <code>null</code> \| <code>Object</code>
Get quota information

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>null</code> \| <code>Object</code> - Returns null if failed, or an object with `used` and `available`  

| Param | Type | Description |
| --- | --- | --- |
| [options] | [<code>OptionsForAdvancedResponses</code>](#OptionsForAdvancedResponses) | Options for the request |

<a name="ClientInterface.moveFile"></a>

### ClientInterface.moveFile(remotePath, targetRemotePath, [options]) ⇒ <code>Promise</code>
Move a remote item to another path

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise</code> - A promise that resolves once the request has completed  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote item path |
| targetRemotePath | <code>String</code> | The new path after moving |
| [options] | [<code>UserOptions</code>](#UserOptions) | Options for the request |

**Example**  
```js
await client.moveFIle("/sub/file.dat", "/another/dir/file.dat");
```
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

**Example**  
```js
await client.putFileContents("/dir/image.png", myImageBuffer);
     // Put contents without overwriting:
     await client.putFileContents("/dir/image.png", myImageBuffer, { overwrite: false });
```
<a name="ClientInterface.getFileUploadLink"></a>

### ClientInterface.getFileUploadLink(remoteFilename, [options]) ⇒ <code>String</code>
Get the upload link
Only supported for Basic authentication or unauthenticated connections.

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>String</code> - A upload URL  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The path of the remote file location |
| [options] | [<code>PutOptions</code>](#PutOptions) | The options for the request |

<a name="ClientInterface.stat"></a>

### ClientInterface.stat(remotePath, [options]) ⇒ <code>Promise.&lt;Object&gt;</code>
Stat a remote object

**Kind**: static method of [<code>ClientInterface</code>](#ClientInterface)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with the stat data  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The path of the item |
| [options] | [<code>OptionsForAdvancedResponses</code>](#OptionsForAdvancedResponses) | Options for the request |

<a name="PutOptions"></a>

## PutOptions : [<code>UserOptions</code>](#UserOptions)
Options for creating a resource

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [overwrite] | <code>Boolean</code> | Whether or not to overwrite existing files (default: true) |

<a name="OptionsWithFormat"></a>

## OptionsWithFormat : [<code>UserOptions</code>](#UserOptions)
Options with headers and format

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| format | <code>String</code> | The format to use (text/binary) |
| [details] | <code>Boolean</code> | Provided detailed response information, such as response  headers (defaults to false). Only available on requests that return result data. |

<a name="OptionsForAdvancedResponses"></a>

## OptionsForAdvancedResponses : [<code>UserOptions</code>](#UserOptions)
Options for methods that resturn responses

**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [details] | <code>Boolean</code> | Provided detailed response information, such as response  headers (defaults to false). Only available on requests that return result data. |

<a name="AuthToken"></a>

## AuthToken : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| token_type | <code>String</code> | The type of token (eg "Bearer") |
| access_token | <code>String</code> | The token access code |

<a name="CreateClientOptions"></a>

## CreateClientOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [username] | <code>String</code> | The username for authentication |
| [password] | <code>String</code> | The password for authentication |
| [httpAgent] | <code>http.Agent</code> | Override the HTTP Agent instance for requests |
| [httpsAgent] | <code>https.Agent</code> | Override the HTTPS Agent instance for requests |
| [token] | [<code>AuthToken</code>](#AuthToken) | Optional OAuth token |

<a name="UserOptions"></a>

## UserOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [httpAgent] | <code>Object</code> | HTTP agent instance |
| [httpsAgent] | <code>Object</code> | HTTPS agent instance |
| [headers] | <code>Object</code> | Set additional request headers |
| [withCredentials] | <code>Boolean</code> | Set whether or not credentials should  be included with the request. Defaults to value used by axios. |

<a name="RequestOptions"></a>

## RequestOptions : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL to request |
| method | <code>String</code> | The method to use (eg. "POST") |
| [headers] | <code>Object</code> | Headers to set on the request |
| [httpAgent] | <code>Object</code> | A HTTP agent instance |
| [httpsAgent] | <code>Object</code> | A HTTPS agent interface |
| body | <code>Object</code> \| <code>String</code> \| <code>\*</code> | Body data for the request |

