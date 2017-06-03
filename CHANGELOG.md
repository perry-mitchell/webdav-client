# WebDAV-client changelog

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
