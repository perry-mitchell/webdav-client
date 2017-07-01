## Functions

<dl>
<dt><a href="#request">request(url, options)</a> ⇒ <code>Promise</code></dt>
<dd><p>Perform a request</p>
</dd>
<dt><a href="#setFetchMethod">setFetchMethod(fn)</a></dt>
<dd><p>Set the fetch method to use when making requests
Defaults to <code>node-fetch</code>. Setting it to <code>null</code> will reset it to <code>node-fetch</code>.</p>
</dd>
<dt><a href="#getQuota">getQuota([options])</a> ⇒ <code>null</code> | <code>Object</code></dt>
<dd><p>Get quota information</p>
</dd>
<dt><a href="#createWebDAVClient">createWebDAVClient(remoteURL)</a> ⇒ <code>Object</code></dt>
<dd><p>Create a webdav client interface</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#ClientInterface">ClientInterface</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#OptionsWithHeaders">OptionsWithHeaders</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#OptionsHeadersAndFormat">OptionsHeadersAndFormat</a> : <code><a href="#OptionsWithHeaders">OptionsWithHeaders</a></code></dt>
<dd></dd>
</dl>

<a name="request"></a>

## request(url, options) ⇒ <code>Promise</code>
Perform a request

**Kind**: global function  
**Returns**: <code>Promise</code> - A promise that resolves with the result  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>String</code> | The URL to fetch |
| options | <code>Object</code> | Fetch options |

<a name="setFetchMethod"></a>

## setFetchMethod(fn)
Set the fetch method to use when making requests
Defaults to `node-fetch`. Setting it to `null` will reset it to `node-fetch`.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| fn | <code>function</code> | Function to use - should perform like `fetch`. |

<a name="getQuota"></a>

## getQuota([options]) ⇒ <code>null</code> &#124; <code>Object</code>
Get quota information

**Kind**: global function  
**Returns**: <code>null</code> &#124; <code>Object</code> - Returns null if failed, or an object with `used` and `available`  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>[OptionsHeadersAndFormat](#OptionsHeadersAndFormat)</code> | Options for the request |

<a name="createWebDAVClient"></a>

## createWebDAVClient(remoteURL) ⇒ <code>Object</code>
Create a webdav client interface

**Kind**: global function  
**Returns**: <code>Object</code> - The client interface  
**Access:** public  
**See**: createClient  

| Param | Type | Description |
| --- | --- | --- |
| remoteURL | <code>String</code> | The target URL |

<a name="ClientInterface"></a>

## ClientInterface : <code>Object</code>
**Kind**: global typedef  

* [ClientInterface](#ClientInterface) : <code>Object</code>
    * [.createDirectory(dirPath, [options])](#ClientInterface.createDirectory) ⇒ <code>Promise</code>
    * [.createReadStream(remoteFilename, [options])](#ClientInterface.createReadStream) ⇒ <code>Readable</code>
    * [.createWriteStream(remoteFilename, [options])](#ClientInterface.createWriteStream) ⇒ <code>Writeable</code>
    * [.deleteFile(remotePath, [options])](#ClientInterface.deleteFile) ⇒ <code>Promise</code>
    * [.getDirectoryContents(remotePath, [options])](#ClientInterface.getDirectoryContents) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [.getFileContents(remoteFilename, [options])](#ClientInterface.getFileContents) ⇒ <code>Promise.&lt;(Buffer\|String)&gt;</code>
    * [.moveFile(remotePath, targetRemotePath, [options])](#ClientInterface.moveFile) ⇒ <code>Promise</code>
    * [.putFileContents(remoteFilename, data, [options])](#ClientInterface.putFileContents) ⇒ <code>Promise</code>
    * [.stat(remotePath, [options])](#ClientInterface.stat) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="ClientInterface.createDirectory"></a>

### ClientInterface.createDirectory(dirPath, [options]) ⇒ <code>Promise</code>
Create a directory

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise</code> - A promise that resolves when the remote path has been created  

| Param | Type | Description |
| --- | --- | --- |
| dirPath | <code>String</code> | The path to create |
| [options] | <code>[OptionsWithHeaders](#OptionsWithHeaders)</code> | Options for the request |

<a name="ClientInterface.createReadStream"></a>

### ClientInterface.createReadStream(remoteFilename, [options]) ⇒ <code>Readable</code>
Create a readable stream of a remote file

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Readable</code> - A readable stream  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to stream |
| [options] | <code>[OptionsHeadersAndFormat](#OptionsHeadersAndFormat)</code> | Options for the request |

<a name="ClientInterface.createWriteStream"></a>

### ClientInterface.createWriteStream(remoteFilename, [options]) ⇒ <code>Writeable</code>
Create a writeable stream to a remote file

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Writeable</code> - A writeable stream  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to write to |
| [options] | <code>[OptionsHeadersAndFormat](#OptionsHeadersAndFormat)</code> | Options for the request |

<a name="ClientInterface.deleteFile"></a>

### ClientInterface.deleteFile(remotePath, [options]) ⇒ <code>Promise</code>
Delete a remote file

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise</code> - A promise that resolves when the remote file as been deleted  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote path to delete |
| [options] | <code>[OptionsWithHeaders](#OptionsWithHeaders)</code> | The options for the request |

<a name="ClientInterface.getDirectoryContents"></a>

### ClientInterface.getDirectoryContents(remotePath, [options]) ⇒ <code>Promise.&lt;Array&gt;</code>
Get the contents of a remote directory

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise.&lt;Array&gt;</code> - A promise that resolves with an array of remote item stats  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The path to fetch the contents of |
| [options] | <code>[OptionsWithHeaders](#OptionsWithHeaders)</code> | Options for the remote the request |

<a name="ClientInterface.getFileContents"></a>

### ClientInterface.getFileContents(remoteFilename, [options]) ⇒ <code>Promise.&lt;(Buffer\|String)&gt;</code>
Get the contents of a remote file

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise.&lt;(Buffer\|String)&gt;</code> - A promise that resolves with the contents of the remote file  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The file to fetch |
| [options] | <code>[OptionsHeadersAndFormat](#OptionsHeadersAndFormat)</code> | Options for the request |

<a name="ClientInterface.moveFile"></a>

### ClientInterface.moveFile(remotePath, targetRemotePath, [options]) ⇒ <code>Promise</code>
Move a remote item to another path

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise</code> - A promise that resolves once the request has completed  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The remote item path |
| targetRemotePath | <code>String</code> | The new path after moving |
| [options] | <code>[OptionsWithHeaders](#OptionsWithHeaders)</code> | Options for the request |

<a name="ClientInterface.putFileContents"></a>

### ClientInterface.putFileContents(remoteFilename, data, [options]) ⇒ <code>Promise</code>
Write contents to a remote file path

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise</code> - A promise that resolves once the contents have been written  

| Param | Type | Description |
| --- | --- | --- |
| remoteFilename | <code>String</code> | The path of the remote file |
| data | <code>String</code> &#124; <code>Buffer</code> | The data to write |
| [options] | <code>[OptionsHeadersAndFormat](#OptionsHeadersAndFormat)</code> | The options for the request |

<a name="ClientInterface.stat"></a>

### ClientInterface.stat(remotePath, [options]) ⇒ <code>Promise.&lt;Object&gt;</code>
Stat a remote object

**Kind**: static method of <code>[ClientInterface](#ClientInterface)</code>  
**Returns**: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with the stat data  

| Param | Type | Description |
| --- | --- | --- |
| remotePath | <code>String</code> | The path of the item |
| [options] | <code>[OptionsWithHeaders](#OptionsWithHeaders)</code> | Options for the request |

<a name="OptionsWithHeaders"></a>

## OptionsWithHeaders : <code>Object</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| headers | <code>Object</code> | Optional headers to send with the request |

<a name="OptionsHeadersAndFormat"></a>

## OptionsHeadersAndFormat : <code>[OptionsWithHeaders](#OptionsWithHeaders)</code>
**Kind**: global typedef  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| format | <code>String</code> | Format of request/response payload (binary/text) |

