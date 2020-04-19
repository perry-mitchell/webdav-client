# WebDAV-Client changelog

## v3.3.0
_2020-04-19_

 * Node 10 build configuration
 * [#201](https://github.com/perry-mitchell/webdav-client/pull/201) Improved object merging for configurations (no merging instances)
 * [#200](https://github.com/perry-mitchell/webdav-client/pull/200) `createWriteStream` callback support (when request finishes finishes)
 * Improved filename decoding
 * **Bugfix**:
   * [#198](https://github.com/perry-mitchell/webdav-client/issues/198) Encoded characters in directory contents (HTML entities)

## v3.2.0
_2020-02-05_

 * `exists` method

## v3.1.0
_2020-02-05_

 * Improved parsing logic for more robust handling of various PROPFIND requests
 * **Bugfix**:
   * [#194](https://github.com/perry-mitchell/webdav-client/issues/194) Several properties not defined in directory-contents / stats payloads
   * [#147](https://github.com/perry-mitchell/webdav-client/issues/147) `Content-length` header being attached to stream requests erroneously

## v3.0.0
_2020-01-26_

 * Removed support for NodeJS < 10
 * Web support
 * Replaced XML parsing library (no dependencies, no streaming - better web support)
 * `createReadStream` and `createWriteStream` stubbed but disabled in web version

## v2.10.2
_2020-01-25_

 * **Bugfix**:
   * [#189](https://github.com/perry-mitchell/webdav-client/issues/189) Maximum call stack size exceeded during digest auth usage (property merging)

## v2.10.1
_2019-12-17_

 * **Bugfix**:
   * [#185](https://github.com/perry-mitchell/webdav-client/issues/185) Extra trailing slash after join for URL components on root account requests

## v2.10.0
_2019-10-12_

 * [#174](https://github.com/perry-mitchell/webdav-client/pull/174) `customRequest` method for making custom requests

## v2.9.1
_2019-07-07_

 * [#162](https://github.com/perry-mitchell/webdav-client/issues/162) etag.replace is not a function (etag string validation)

## v2.9.0
_2019-07-07_

 * [#40](https://github.com/perry-mitchell/webdav-client/issues/40) Digest authentication support

## v2.8.0
_2018-05-26_

 * Remove `path` dependency

## v2.7.0
_2019-05-23_

 * [#149](https://github.com/perry-mitchell/webdav-client/issues/149) Upload progress for `putFileContents`
 * [#154](https://github.com/perry-mitchell/webdav-client/pull/154) Normalise MIME type

## v2.6.0
_2019-03-03_

 * [#122](https://github.com/perry-mitchell/webdav-client/issues/122) Glob functionality
 * [#144](https://github.com/perry-mitchell/webdav-client/issues/144) Support uploading larger files

## v2.5.0
_2019-01-24_

 * [#130](https://github.com/perry-mitchell/webdav-client/issues/130) Support for `deep` option on `getDirectoryContents`

## v2.4.0
_2019-01-23_

 * [#132](https://github.com/perry-mitchell/webdav-client/issues/132) ETags in `getDirectoryContents` results and stats

## v2.3.0
_2019-01-22_

 * [#134](https://github.com/perry-mitchell/webdav-client/issues/134) Allow access to all returned properties

## v2.2.1
_2019-01-10_

 * [#121](https://github.com/perry-mitchell/webdav-client/issues/121) Unexpected close tag - trailing slash bug
 * [#127](https://github.com/perry-mitchell/webdav-client/issues/127) Force trailing slash
 * [#126](https://github.com/perry-mitchell/webdav-client/issues/126) `copyFile`: Failed to execute 'setRequestHeader' on 'XMLHttpRequest': Value is not a valid ByteString

## v2.2.0
_2018-12-12_

 * Replace Buffer usage for base64 encoding with `base-64` package

## v2.1.0
_2018-12-12_

 * Move node core imports into functions (downstream compatibility - React Native)
 * Upgrade dependencies

## **v2.0.0**
_2018-11-20_

 * **Major version update!**
   * Fetch has been replaced with Axios! tl;dr `fetch` is horrible when looking to make webdav-client compatible cross-platform. Axios is a great alternative.
   * Detailed responses now available on some methods (providing response headers, for example)

## 1.6.1
_2018-10-06_

 * [#109](https://github.com/perry-mitchell/webdav-client/issues/109) `getDirectoryContents` fails on Seafile responses
 * Remove dependency on just a handful of namespaces for multistatus responses

## 1.6.0
_2018-09-15_

 * Update dependencies, audit vulnerabilities

## 1.5.5
_2018-09-13_

 * [#104](https://github.com/perry-mitchell/webdav-client/issues/104) `path.posix` failed in browserify
 * **Dev**:
   * Webpack & KarmaJS dev testing in Chrome

## 1.5.4
_2018-09-11_

 * [#101](https://github.com/perry-mitchell/webdav-client/issues/101) `getDirectoryContents` fails on windows
 * [#98](https://github.com/perry-mitchell/webdav-client/issues/98) Moving items fails when destination contains spaces

## 1.5.3
_2018-07-07_

 * ([#91](https://github.com/perry-mitchell/webdav-client/issues/91) [#93](https://github.com/perry-mitchell/webdav-client/issues/93)): Bugfix: Encoding issues with special characters

## 1.5.2
_2018-03-25_

 * Fix bug where requesting directory contents at paths with trailing slashes would return parent directory in results

## 1.5.1
_2018-03-23_

 * ([#81](https://github.com/perry-mitchell/webdav-client/issues/81)): Bad encoding when paths are prefixed with directory separator

## 1.5.0
_2018-03-19_

 * Add OAuth2 authentication support (via token)
 * Add `getFileDownloadLink` method

## 1.4.0
_2018-03-13_

 * Add `copyFile` method

## 1.3.0
_2018-03-07_

 * Change `deepmerge` dependency to `merge`
 * ([#79](https://github.com/perry-mitchell/webdav-client/issues/79)): getFileContents arrayBuffer default causes incompatibilities
   * Use `buffer()` where available, and fallback to `arrayBuffer()` otherwise

## 1.2.1
_2018-02-26_

 * Downgrade `deepmerge` to 1.5.2 to fix Webpack bug

## 1.2.0
_2018-02-24_

 * ([#74](https://github.com/perry-mitchell/webdav-client/issues/74)): TypeError: res.buffer is not a function (`ArrayBuffer` replaces `Buffer` for node-fetch)
 * ([#66](https://github.com/perry-mitchell/webdav-client/issues/66)): Special characters break output (unicode/non-latin encoding)

## 1.1.2
_2018-02-21_

 * Development bug fixes

## 1.1.1

**Bugfixes**:

 * ([#68](https://github.com/perry-mitchell/webdav-client/issues/68)): Fetched directory appearing in results

## 1.1.0
_2017-08-30_

 * Add transpilation process for published library

## 1.0.1
_2017-08-07_

 * Allow `test/` directory during publish (used downstream)

## **1.0.0**
_2017-08-06_

 * Complete rewrite of the project
 * Better testing setup with webdav-server
 * **Bugfixes**:
   * [Directory contents parse bug](https://github.com/perry-mitchell/webdav-client/issues/54)

## 1.0.0-rc1
_2017-07-01_

 * URI encoding for special characters
 * Writeable streams
 * Internal `fetch` override support
 * Quota support
 * Remove duplicate methods
 * Optimise `stat` depth

## 0.10.0
_2017-06-24_

 * Disable native `window.fetch` in browsers

## 0.9.0
_2017-06-07_

 * Add support for ranges with only `start`

## 0.8.0
_2017-06-07_

 * Add stream support (GET)
 * Add `createReadStream` method
 * Add `getFileStream` method
 * Update option merging behaviour for default values

## 0.7.0
_2017-06-03_

 * Remove lodash (performance improvement)

## 0.6.0
_2017-04-13_

 * Support for non-prefixed XML elements in WebDAV response
 * HTTP status code for thrown exceptions

## 0.5.0
_2017-02-11_

 * Use `window.fetch` when available in browser

## 0.4.1
_2017-02-04_

 * Fix `putFileContents` authorisation bug

## 0.4.0
_2017-01-29_

 * Add `options` argument to all methods, allowing custom headers
 * **(Breaking)**
   * Move `format` arguments to `options` object
   * Removed node 0.12 support

## 0.3.1
_2017-01-18_

 * Remove node querystring calls for downstream compat

## 0.2.0
_2017-01-03_

 * Added `options` parameter to `putFileContents`

## 0.1.1
_2016_10_24_

 * Fixed username/password authentication with special characters

## 0.1.0
_2016-10-13_

 * Initial release
