# WebDAV-client changelog

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
