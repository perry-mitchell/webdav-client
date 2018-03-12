---


---

<p><img src="https://raw.githubusercontent.com/perry-mitchell/webdav-client/master/webdav.jpg" alt="WebDAV"></p>
<blockquote>
<p>A WebDAV client written in JavaScript for NodeJS.</p>
</blockquote>
<p><a href="https://travis-ci.org/perry-mitchell/webdav-client"><img src="https://travis-ci.org/perry-mitchell/webdav-client.svg?branch=master" alt="Build Status"></a> <a href="https://www.npmjs.com/package/webdav"><img src="https://badge.fury.io/js/webdav.svg" alt="npm version"></a> <img src="https://img.shields.io/npm/dm/webdav.svg" alt="monthly downloads"></p>
<h2 id="about">About</h2>
<p>This client was branched from <a href="https://github.com/perry-mitchell/webdav-fs">webdav-fs</a> as the core functionality deserved its own repository. As <strong>webdav-fs</strong>’ API was designed to resemble NodeJS’ fs API, little could be done to improve the adapter interface for regular use.</p>
<p>This WebDAV client library is designed to provide an improved API for low-level WebDAV integration. This client uses <code>window.fetch</code> when available in the browser.</p>
<h2 id="installation">Installation</h2>
<p>To install for use with NodeJS, execute the following shell command:</p>
<pre class=" language-shell"><code class="prism  language-shell">npm install webdav --save
</code></pre>
<h3 id="webpack--browserify">Webpack / Browserify</h3>
<p>WebDAV-client is browser friendly, after being transpiled. Refer to the use of WebDAV-fs in the <a href="https://github.com/buttercup/buttercup-mobile-compat">Buttercup mobile compatibility library</a> or the <a href="https://github.com/buttercup/buttercup-browser-extension">Buttercup browser extension</a> for guidance on preparation for the web.</p>
<h2 id="usage">Usage</h2>
<p>Usage is very simple (<a href="API.md">API</a>) - the main exported object is a factory to create adapter instances:</p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">var</span> createClient <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"webdav"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">var</span> client <span class="token operator">=</span> <span class="token function">createClient</span><span class="token punctuation">(</span>
    <span class="token string">"https://webdav-server.org/remote.php/webdav"</span><span class="token punctuation">,</span>
    <span class="token string">"username"</span><span class="token punctuation">,</span>
    <span class="token string">"password"</span>
<span class="token punctuation">)</span><span class="token punctuation">;</span>

client
    <span class="token punctuation">.</span><span class="token function">getDirectoryContents</span><span class="token punctuation">(</span><span class="token string">"/"</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span>contents<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>JSON<span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>contents<span class="token punctuation">,</span> undefined<span class="token punctuation">,</span> <span class="token number">4</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p>Each method returns a <code>Promise</code>.</p>
<h3 id="adapter-methods">Adapter methods</h3>
<p>These methods can be called on the object returned from the main factory.</p>
<h4 id="createdirectoryremotepath--options">createDirectory(remotePath <em>[, options]</em>)</h4>
<p>Create a new directory at the remote path.</p>
<h4 id="createreadstreamremotepath--options">createReadStream(remotePath <em>[, options]</em>)</h4>
<p>Creates a readable stream on the remote path.</p>
<p>Returns a readable stream instance.</p>
<h4 id="createwritestreamremotepath--options">createWriteStream(remotePath <em>[, options]</em>)</h4>
<p>Creates a writeable stream to a remote path.</p>
<p>Returns a writeable stream instance.</p>
<h4 id="deletefileremotepath--options">deleteFile(remotePath <em>[, options]</em>)</h4>
<p>Delete a file or directory at <code>remotePath</code>.</p>
<h4 id="getdirectorycontentsremotepath--options">getDirectoryContents(remotePath <em>[, options]</em>)</h4>
<p>Get an array of items within a directory. <code>remotePath</code> is a string that begins with a forward-slash and indicates the remote directory to get the contents of.</p>
<pre class=" language-js"><code class="prism  language-js">client
    <span class="token punctuation">.</span><span class="token function">getDirectoryContents</span><span class="token punctuation">(</span><span class="token string">"/MyFolder"</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span>contents<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>JSON<span class="token punctuation">.</span><span class="token function">stringify</span><span class="token punctuation">(</span>contents<span class="token punctuation">,</span> undefined<span class="token punctuation">,</span> <span class="token number">2</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p>The returned value is a Promise, which resolves with an array of <a href="#item-stat">item stat objects</a>.</p>
<h4 id="getfilecontentsremotepath--options">getFileContents(remotePath <em>[, options]</em>)</h4>
<p>Get the contents of the file at <code>remotePath</code> as a <code>Buffer</code> or <code>String</code>. <code>format</code> can either be “binary” or “text”, where “binary” is default.</p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">var</span> fs <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"fs"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

client
    <span class="token punctuation">.</span><span class="token function">getFileContents</span><span class="token punctuation">(</span><span class="token string">"/folder/myImage.jpg"</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span>imageData<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        fs<span class="token punctuation">.</span><span class="token function">writeFileSync</span><span class="token punctuation">(</span><span class="token string">"./myImage.jpg"</span><span class="token punctuation">,</span> imageData<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p>Or with text:</p>
<pre class=" language-js"><code class="prism  language-js">client
    <span class="token punctuation">.</span><span class="token function">getFileContents</span><span class="token punctuation">(</span><span class="token string">"/doc.txt"</span><span class="token punctuation">,</span> <span class="token string">"text"</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span>text<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        console<span class="token punctuation">.</span><span class="token function">log</span><span class="token punctuation">(</span>text<span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p><strong>Important</strong>: When running on Node, <code>node-fetch</code> is used as the default fetch library. <code>node-fetch</code> provides the <code>.buffer()</code> method for responses, which returns a <code>Buffer</code> instance, but other libraries (and standard <code>fetch</code>) do not. When the <code>buffer</code> method is not available, this library will attempt to use <code>.arrayBuffer</code>. It is your responsibility to handle the output and any required conversion. The <a href="https://www.npmjs.com/package/arraybuffer-to-buffer"><code>arraybuffer-to-buffer</code></a> library makes it easy to convert back to a <code>Buffer</code> if you require it.</p>
<h4 id="getfilestreamremotepath--options">getFileStream(remotePath <em>[, options]</em>)</h4>
<p>Get a readable stream on a remote file. Returns a Promise that resolves with a readable stream instance.</p>
<p><em>This is the underlying method to <code>createReadStream</code> (uses a <code>PassThrough</code> stream to delay the data). Due to the requirement of waiting on the request to complete before being able to get the <strong>true</strong> read stream, a Promise is returned that resolves when it becomes available. <code>createReadStream</code> simply creates and returns a <code>PassThrough</code> stream immediately and writes to it once this method resolves.</em></p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">var</span> fs <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"fs"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

client
    <span class="token punctuation">.</span><span class="token function">getFileStream</span><span class="token punctuation">(</span><span class="token string">"/test/image.png"</span><span class="token punctuation">)</span>
    <span class="token punctuation">.</span><span class="token function">then</span><span class="token punctuation">(</span><span class="token keyword">function</span><span class="token punctuation">(</span>imageStream<span class="token punctuation">)</span> <span class="token punctuation">{</span>
        imageStream<span class="token punctuation">.</span><span class="token function">pipe</span><span class="token punctuation">(</span>fs<span class="token punctuation">.</span><span class="token function">createWriteStream</span><span class="token punctuation">(</span><span class="token string">"./image.png"</span><span class="token punctuation">)</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
    <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p><code>options</code> is an object that may look like the following:</p>
<pre class=" language-json"><code class="prism  language-json"><span class="token punctuation">{</span>
    <span class="token string">"headers"</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
<span class="token punctuation">}</span>
</code></pre>
<h5 id="options.range">options.range</h5>
<p>Optionally request part of the remote file by specifying the <code>start</code> and <code>end</code> byte positions. The <code>end</code> byte position is optional and the rest of the file from <code>start</code> onwards will be streamed.</p>
<pre class=" language-javascript"><code class="prism  language-javascript"><span class="token keyword">var</span> stream <span class="token operator">=</span> client<span class="token punctuation">.</span><span class="token function">getFileStream</span><span class="token punctuation">(</span><span class="token string">"/test/image.png"</span><span class="token punctuation">,</span> <span class="token punctuation">{</span>
    range<span class="token punctuation">:</span> <span class="token punctuation">{</span> start<span class="token punctuation">:</span> <span class="token number">0</span><span class="token punctuation">,</span> end<span class="token punctuation">:</span> <span class="token number">499</span> <span class="token punctuation">}</span> <span class="token comment">// first 500 bytes</span>
<span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<h4 id="getquotaoptions">getQuota(<em>[options]</em>)</h4>
<p>Get quota information. Returns <code>null</code> upon failure or an object like so:</p>
<pre class=" language-json"><code class="prism  language-json"><span class="token punctuation">{</span>
    <span class="token string">"used"</span><span class="token punctuation">:</span> <span class="token string">"12842"</span><span class="token punctuation">,</span>
    <span class="token string">"available"</span><span class="token punctuation">:</span> <span class="token string">"512482001"</span>
<span class="token punctuation">}</span>
</code></pre>
<p>Both values are provided in bytes in string form. <code>available</code> may also be one of the following:</p>
<ul>
<li><code>unknown</code>: The available space is unknown or not yet calculated</li>
<li><code>unlimited</code>: The space available is not limited by quotas</li>
</ul>
<h4 id="movefileremotepath-targetpath--options">moveFile(remotePath, targetPath <em>[, options]</em>)</h4>
<p>Move a file or directory from <code>remotePath</code> to <code>targetPath</code>.</p>
<pre class=" language-js"><code class="prism  language-js"><span class="token comment">// Move a directory</span>
client<span class="token punctuation">.</span><span class="token function">moveFile</span><span class="token punctuation">(</span><span class="token string">"/some-dir"</span><span class="token punctuation">,</span> <span class="token string">"/storage/moved-dir"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// Rename a file</span>
client<span class="token punctuation">.</span><span class="token function">moveFile</span><span class="token punctuation">(</span><span class="token string">"/images/pic.jpg"</span><span class="token punctuation">,</span> <span class="token string">"/images/profile.jpg"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<h4 id="copyfileremotepath-targetpath--options">copyFile(remotePath, targetPath <em>[, options]</em>)</h4>
<p>Copy a file or directory from <code>remotePath</code> to <code>targetPath</code>.</p>
<pre class=" language-js"><code class="prism  language-js"><span class="token comment">// Copy a directory</span>
client<span class="token punctuation">.</span><span class="token function">copyFile</span><span class="token punctuation">(</span><span class="token string">"/some-dir"</span><span class="token punctuation">,</span> <span class="token string">"/storage/moved-dir"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token comment">// Copy a file</span>
client<span class="token punctuation">.</span><span class="token function">copyFile</span><span class="token punctuation">(</span><span class="token string">"/images/pic.jpg"</span><span class="token punctuation">,</span> <span class="token string">"/somefolder/profile.jpg"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<h4 id="putfilecontentsremotepath-data--options">putFileContents(remotePath, data <em>[, options]</em>)</h4>
<p>Put some data in a remote file at <code>remotePath</code> from a <code>Buffer</code> or <code>String</code>. <code>data</code> is a <code>Buffer</code> or a <code>String</code>. <code>options</code> has a property called <code>format</code> which can be “binary” (default) or “text”.</p>
<pre class=" language-js"><code class="prism  language-js"><span class="token keyword">var</span> fs <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"fs"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

<span class="token keyword">var</span> imageData <span class="token operator">=</span> fs<span class="token punctuation">.</span><span class="token function">readFileSync</span><span class="token punctuation">(</span><span class="token string">"someImage.jpg"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>

client<span class="token punctuation">.</span><span class="token function">putFileContents</span><span class="token punctuation">(</span><span class="token string">"/folder/myImage.jpg"</span><span class="token punctuation">,</span> imageData<span class="token punctuation">,</span> <span class="token punctuation">{</span> format<span class="token punctuation">:</span> <span class="token string">"binary"</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<pre class=" language-js"><code class="prism  language-js">client<span class="token punctuation">.</span><span class="token function">putFileContents</span><span class="token punctuation">(</span><span class="token string">"/example.txt"</span><span class="token punctuation">,</span> <span class="token string">"some text"</span><span class="token punctuation">,</span> <span class="token punctuation">{</span> format<span class="token punctuation">:</span> <span class="token string">"text"</span> <span class="token punctuation">}</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<p><code>options</code>, which is <strong>optional</strong>, can be set to an object like the following:</p>
<pre class=" language-json"><code class="prism  language-json"><span class="token punctuation">{</span>
    <span class="token string">"format"</span><span class="token punctuation">:</span> <span class="token string">"binary"</span><span class="token punctuation">,</span>
    <span class="token string">"headers"</span><span class="token punctuation">:</span> <span class="token punctuation">{</span>
        <span class="token string">"Content-Type"</span><span class="token punctuation">:</span> <span class="token string">"application/octet-stream"</span>
    <span class="token punctuation">}</span><span class="token punctuation">,</span>
    <span class="token string">"overwrite"</span><span class="token punctuation">:</span> <span class="token boolean">true</span>
<span class="token punctuation">}</span>
</code></pre>
<blockquote>
<p><code>options.overwrite</code> (default: <code>true</code>), if set to false, will add an additional header which tells the server to abort writing if the target already exists.</p>
</blockquote>
<h4 id="statremotepath--options">stat(remotePath <em>[, options]</em>)</h4>
<p>Get the stat properties of a remote file or directory at <code>remotePath</code>. Resolved object is a <a href="#item-stat">item stat object</a>.</p>
<h3 id="overriding-the-built-in-fetch-function">Overriding the built-in fetch function</h3>
<p>Under the hood, <code>webdav-client</code> uses <a href="https://github.com/bitinn/node-fetch"><code>node-fetch</code></a> to perform requests. This can be overridden by running the following:</p>
<pre class=" language-js"><code class="prism  language-js"><span class="token comment">// For example, use the `fetch` method in the browser:</span>
<span class="token keyword">const</span> createWebDAVClient <span class="token operator">=</span> <span class="token function">require</span><span class="token punctuation">(</span><span class="token string">"webdav"</span><span class="token punctuation">)</span><span class="token punctuation">;</span>
createWebDAVClient<span class="token punctuation">.</span><span class="token function">setFetchMethod</span><span class="token punctuation">(</span>window<span class="token punctuation">.</span>fetch<span class="token punctuation">)</span><span class="token punctuation">;</span>
</code></pre>
<h3 id="returned-data-structures">Returned data structures</h3>
<h4 id="item-stat">Item stat</h4>
<p>Item stats are objects with properties that descibe a file or directory. They resemble the following:</p>
<pre class=" language-json"><code class="prism  language-json"><span class="token punctuation">{</span>
    <span class="token string">"filename"</span><span class="token punctuation">:</span> <span class="token string">"/test"</span><span class="token punctuation">,</span>
    <span class="token string">"basename"</span><span class="token punctuation">:</span> <span class="token string">"test"</span><span class="token punctuation">,</span>
    <span class="token string">"lastmod"</span><span class="token punctuation">:</span> <span class="token string">"Tue, 05 Apr 2016 14:39:18 GMT"</span><span class="token punctuation">,</span>
    <span class="token string">"size"</span><span class="token punctuation">:</span> <span class="token number">0</span><span class="token punctuation">,</span>
    <span class="token string">"type"</span><span class="token punctuation">:</span> <span class="token string">"directory"</span>
<span class="token punctuation">}</span>
</code></pre>
<p>or:</p>
<pre class=" language-json"><code class="prism  language-json"><span class="token punctuation">{</span>
    <span class="token string">"filename"</span><span class="token punctuation">:</span> <span class="token string">"/image.jpg"</span><span class="token punctuation">,</span>
    <span class="token string">"basename"</span><span class="token punctuation">:</span> <span class="token string">"image.jpg"</span><span class="token punctuation">,</span>
    <span class="token string">"lastmod"</span><span class="token punctuation">:</span> <span class="token string">"Sun, 13 Mar 2016 04:23:32 GMT"</span><span class="token punctuation">,</span>
    <span class="token string">"size"</span><span class="token punctuation">:</span> <span class="token number">42497</span><span class="token punctuation">,</span>
    <span class="token string">"type"</span><span class="token punctuation">:</span> <span class="token string">"file"</span><span class="token punctuation">,</span>
    <span class="token string">"mime"</span><span class="token punctuation">:</span> <span class="token string">"image/jpeg"</span>
<span class="token punctuation">}</span>
</code></pre>
<p>Properties:</p>

<table>
<thead>
<tr>
<th>Property name</th>
<th>Type</th>
<th>Present</th>
<th>Description</th>
</tr>
</thead>
<tbody>
<tr>
<td>filename</td>
<td>String</td>
<td>Always</td>
<td>File path of the remote item</td>
</tr>
<tr>
<td>basename</td>
<td>String</td>
<td>Always</td>
<td>Base filename of the remote item, no path</td>
</tr>
<tr>
<td>lastmod</td>
<td>String</td>
<td>Always</td>
<td>Last modification date of the item</td>
</tr>
<tr>
<td>size</td>
<td>Number</td>
<td>Always</td>
<td>File size - 0 for directories</td>
</tr>
<tr>
<td>type</td>
<td>String</td>
<td>Always</td>
<td>Item type - “file” or “directory”</td>
</tr>
<tr>
<td>mime</td>
<td>String</td>
<td>Files only</td>
<td>Mime type - for file items only</td>
</tr>
</tbody>
</table><h2 id="compatibility">Compatibility</h2>
<p>This library has been tested to work with the following WebDAV servers or applications:</p>
<ul>
<li><a href="https://owncloud.org/">ownCloud</a></li>
<li><a href="https://nextcloud.com/">Nextcloud</a></li>
<li><a href="https://yandex.ru/">Yandex.ru</a></li>
<li><a href="https://github.com/mikedeboer/jsDAV">jsDAV</a></li>
<li><a href="https://github.com/OpenMarshal/npm-WebDAV-Server">webdav-server</a></li>
</ul>

