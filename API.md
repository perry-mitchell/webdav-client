---


---

<h2 id="modules">Modules</h2>
<dl>
<dt><a href="#module_WebDAV">WebDAV</a> ⇒ <code><a href="#ClientInterface">ClientInterface</a></code></dt>
<dd><p>Create a client adapter</p>
</dd>
</dl>
<h2 id="functions">Functions</h2>
<dl>
<dt><a href="#encodePath">encodePath(path)</a> ⇒ <code>String</code></dt>
<dd><p>Encode a path for use with WebDAV servers</p>
</dd>
<dt><a href="#setFetchMethod">setFetchMethod(fn)</a></dt>
<dd><p>Set the fetch method to use when making requests
Defaults to <code>node-fetch</code>. Setting it to <code>null</code> will reset it to <code>node-fetch</code>.</p>
</dd>
</dl>
<h2 id="typedefs">Typedefs</h2>
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
<p><a></a></p>
<h2 id="webdav-⇒-codeclientinterfacecode">WebDAV ⇒ <a href="#ClientInterface"><code>ClientInterface</code></a></h2>
<p>Create a client adapter</p>
<p><strong>Returns</strong>: <a href="#ClientInterface"><code>ClientInterface</code></a> - A new client interface instance</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remoteURL</td>
<td><code>String</code></td>
<td>The remote address of the webdav server</td>
</tr>
<tr>
<td>[username]</td>
<td><code>String</code></td>
<td>Optional username for authentication</td>
</tr>
<tr>
<td>[password]</td>
<td><code>String</code></td>
<td>Optional password for authentication</td>
</tr>
</tbody>
</table><p><strong>Example</strong></p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">const</span> createClient <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"webdav"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 <span class="token keyword">const</span> client <span class="token operator">=</span> <span class="token function">createClient</span><span class="token punctuation">(</span>url<span class="token punctuation">,</span> username<span class="token punctuation">,</span> password<span class="token punctuation">)</span><span class="token punctuation">;</span>
 client
     <span class="token punctuation">.</span><span class="token function">getDirectoryContents</span><span class="token punctuation">(</span><span class="token string">"/"</span><span class="token punctuation">)</span>
     <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span>contents <span class="token operator">=&gt;</span> <span class="token punctuation">{</span>
         console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>contents<span class="token punctuation">)</span><span class="token punctuation">;</span>
     <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p><a></a></p>
<h2 id="encodepathpath-⇒-codestringcode">encodePath(path) ⇒ <code>String</code></h2>
<p>Encode a path for use with WebDAV servers</p>
<p><strong>Kind</strong>: global function<br>
<strong>Returns</strong>: <code>String</code> - The encoded path (separators protected)</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>path</td>
<td><code>String</code></td>
<td>The path to encode</td>
</tr>
</tbody>
</table><p><a></a></p>
<h2 id="setfetchmethodfn">setFetchMethod(fn)</h2>
<p>Set the fetch method to use when making requests<br>
Defaults to <code>node-fetch</code>. Setting it to <code>null</code> will reset it to <code>node-fetch</code>.</p>
<p><strong>Kind</strong>: global function</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>fn</td>
<td><code>function</code></td>
<td>Function to use - should perform like <code>fetch</code>.</td>
</tr>
</tbody>
</table><p><strong>Example</strong></p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">const</span> createClient <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"webdav"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
 createClient<span class="token punctuation">.</span><span class="token function">setFetchMethod</span><span class="token punctuation">(</span>window<span class="token punctuation">.</span>fetch<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p><a></a></p>
<h2 id="clientinterface--codeobjectcode">ClientInterface : <code>Object</code></h2>
<p>Client adapter</p>
<p><strong>Kind</strong>: global typedef</p>
<ul>
<li><a href="#ClientInterface">ClientInterface</a> : <code>Object</code>
<ul>
<li><a href="#ClientInterface.createDirectory">.createDirectory(dirPath, [options])</a> ⇒ <code>Promise</code></li>
<li><a href="#ClientInterface.createReadStream">.createReadStream(remoteFilename, [options])</a> ⇒ <code>Readable</code></li>
<li><a href="#ClientInterface.createWriteStream">.createWriteStream(remoteFilename, [options])</a> ⇒ <code>Writeable</code></li>
<li><a href="#ClientInterface.deleteFile">.deleteFile(remotePath, [options])</a> ⇒ <code>Promise</code></li>
<li><a href="#ClientInterface.getDirectoryContents">.getDirectoryContents(remotePath, [options])</a> ⇒ <code>Promise.&lt;Array&gt;</code></li>
<li><a href="#ClientInterface.getFileContents">.getFileContents(remoteFilename, [options])</a> ⇒ <code>Promise.&lt;(Buffer|String)&gt;</code></li>
<li><a href="#ClientInterface.getQuota">.getQuota([options])</a> ⇒ <code>null</code> | <code>Object</code></li>
<li><a href="#ClientInterface.moveFile">.moveFile(remotePath, targetRemotePath, [options])</a> ⇒ <code>Promise</code></li>
<li><a href="#ClientInterface.copyFile">.copyFile(remotePath, targetRemotePath, [options])</a> ⇒ <code>Promise</code></li>
<li><a href="#ClientInterface.putFileContents">.putFileContents(remoteFilename, data, [options])</a> ⇒ <code>Promise</code></li>
<li><a href="#ClientInterface.stat">.stat(remotePath, [options])</a> ⇒ <code>Promise.&lt;Object&gt;</code></li>
</ul>
</li>
</ul>
<p><a></a></p>
<h3 id="clientinterface.createdirectorydirpath-options-⇒-codepromisecode">ClientInterface.createDirectory(dirPath, [options]) ⇒ <code>Promise</code></h3>
<p>Create a directory</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise</code> - A promise that resolves when the remote path has been created</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>dirPath</td>
<td><code>String</code></td>
<td>The path to create</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.createreadstreamremotefilename-options-⇒-codereadablecode">ClientInterface.createReadStream(remoteFilename, [options]) ⇒ <code>Readable</code></h3>
<p>Create a readable stream of a remote file</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Readable</code> - A readable stream</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remoteFilename</td>
<td><code>String</code></td>
<td>The file to stream</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.createwritestreamremotefilename-options-⇒-codewriteablecode">ClientInterface.createWriteStream(remoteFilename, [options]) ⇒ <code>Writeable</code></h3>
<p>Create a writeable stream to a remote file</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Writeable</code> - A writeable stream</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remoteFilename</td>
<td><code>String</code></td>
<td>The file to write to</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#PutOptions"><code>PutOptions</code></a></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.deletefileremotepath-options-⇒-codepromisecode">ClientInterface.deleteFile(remotePath, [options]) ⇒ <code>Promise</code></h3>
<p>Delete a remote file</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise</code> - A promise that resolves when the remote file as been deleted</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remotePath</td>
<td><code>String</code></td>
<td>The remote path to delete</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>The options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.getdirectorycontentsremotepath-options-⇒-codepromise.arraycode">ClientInterface.getDirectoryContents(remotePath, [options]) ⇒ <code>Promise.&lt;Array&gt;</code></h3>
<p>Get the contents of a remote directory</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise.&lt;Array&gt;</code> - A promise that resolves with an array of remote item stats</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remotePath</td>
<td><code>String</code></td>
<td>The path to fetch the contents of</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>Options for the remote the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.getfilecontentsremotefilename-options-⇒-codepromise.bufferstringcode">ClientInterface.getFileContents(remoteFilename, [options]) ⇒ <code>Promise.&lt;(Buffer|String)&gt;</code></h3>
<p>Get the contents of a remote file</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise.&lt;(Buffer|String)&gt;</code> - A promise that resolves with the contents of the remote file</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remoteFilename</td>
<td><code>String</code></td>
<td>The file to fetch</td>
</tr>
<tr>
<td>[options]</td>
<td><code>OptionsHeadersAndFormat</code></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.getquotaoptions-⇒-codenullcode--codeobjectcode">ClientInterface.getQuota([options]) ⇒ <code>null</code> | <code>Object</code></h3>
<p>Get quota information</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>null</code> | <code>Object</code> - Returns null if failed, or an object with <code>used</code> and <code>available</code></p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>[options]</td>
<td><code>OptionsHeadersAndFormat</code></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.movefileremotepath-targetremotepath-options-⇒-codepromisecode">ClientInterface.moveFile(remotePath, targetRemotePath, [options]) ⇒ <code>Promise</code></h3>
<p>Move a remote item to another path</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise</code> - A promise that resolves once the request has completed</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remotePath</td>
<td><code>String</code></td>
<td>The remote item path</td>
</tr>
<tr>
<td>targetRemotePath</td>
<td><code>String</code></td>
<td>The new path after moving</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<p><a></a></p>
<h3 id="clientinterface.copyfileremotepath-targetremotepath-options-⇒-codepromisecode">ClientInterface.copyFile(remotePath, targetRemotePath, [options]) ⇒ <code>Promise</code></h3>
<p>Copy a remote item to a path</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise</code> - A promise that resolves once the request has completed</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remotePath</td>
<td><code>String</code></td>
<td>The remote item path</td>
</tr>
<tr>
<td>targetRemotePath</td>
<td><code>String</code></td>
<td>The new path after moving</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.putfilecontentsremotefilename-data-options-⇒-codepromisecode">ClientInterface.putFileContents(remoteFilename, data, [options]) ⇒ <code>Promise</code></h3>
<p>Write contents to a remote file path</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise</code> - A promise that resolves once the contents have been written</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remoteFilename</td>
<td><code>String</code></td>
<td>The path of the remote file</td>
</tr>
<tr>
<td>data</td>
<td><code>String</code> | <code>Buffer</code></td>
<td>The data to write</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#PutOptions"><code>PutOptions</code></a></td>
<td>The options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h3 id="clientinterface.statremotepath-options-⇒-codepromise.objectcode">ClientInterface.stat(remotePath, [options]) ⇒ <code>Promise.&lt;Object&gt;</code></h3>
<p>Stat a remote object</p>
<p><strong>Kind</strong>: static method of <a href="#ClientInterface"><code>ClientInterface</code></a><br>
<strong>Returns</strong>: <code>Promise.&lt;Object&gt;</code> - A promise that resolves with the stat data</p>

<table>
<thead>
<tr>
<th>Param</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>remotePath</td>
<td><code>String</code></td>
<td>The path of the item</td>
</tr>
<tr>
<td>[options]</td>
<td><a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></td>
<td>Options for the request</td>
</tr>
</tbody>
</table><p><a></a></p>
<h2 id="optionswithheaders--codeobjectcode">OptionsWithHeaders : <code>Object</code></h2>
<p>Options with header object</p>
<p><strong>Kind</strong>: global typedef<br>
<strong>Properties</strong></p>

<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>headers</td>
<td><code>Object</code></td>
<td>Headers key-value list</td>
</tr>
</tbody>
</table><p><a></a></p>
<h2 id="putoptions--codeoptionswithheaderscode">PutOptions : <a href="#OptionsWithHeaders"><code>OptionsWithHeaders</code></a></h2>
<p>Options for creating a resource</p>
<p><strong>Kind</strong>: global typedef<br>
<strong>Properties</strong></p>

<table>
<thead>
<tr>
<th>Name</th>
<th>Type</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>[overwrite]</td>
<td><code>Boolean</code></td>
<td>Whether or not to overwrite existing files (default: true)</td>
</tr>
</tbody>
</table>
