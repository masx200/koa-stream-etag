# @masx200/koa-stream-etag

forked from https://github.com/koajs/etag

If the response of the koa server is a stream without a path, the response header of etag can also be generated,The etag response header is generated by converting stream to buffer for etag calculation.

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Dependency Status][david-image]][david-url]
[![License][license-image]][license-url]
[![Downloads][downloads-image]][downloads-url]

stream Etag support for Koa responses using [etag](https://github.com/jshttp/etag).

## Installation

### npm

```bash

$ npm install @masx200/koa-stream-etag
```

### yarn

```
$ yarn add @masx200/koa-stream-etag
```

# API

```js
var etag = require("@masx200/koa-stream-etag");
```

## `etag([options])`

Generate a strong ETag for the given entity. This should be the complete body of the entity. Strings, Buffers, and fs.Stats are accepted. By default, a strong ETag is generated except for fs.Stats, which will generate a weak ETag (this can be overwritten by options.weak).

```js
var options = { weak: false, sizelimit: 100 * 1024 };
app.use(etag(options));
```

## Options

etag accepts these properties in the options object.

### `weak`

Specifies if the generated ETag will include the weak validator mark (that is, the leading W/). The actual entity tag is the same. The default value is false, unless the entity is fs.Stats, in which case it is true.

### `sizelimit`

'sizelimit'.Its unit is byte.If the size of the stream is smaller than the'sizelimit', the etag response header will be generated,by converting stream to buffer for etag calculation.

## Example

```js
const conditional = require("koa-conditional-get");
const etag = require("@masx200/koa-stream-etag");
const Koa = require("koa");
const app = new Koa();

// etag works together with conditional-get
app.use(conditional());
app.use(etag({}));

app.use(function (ctx) {
    ctx.body = "Hello World";
});

app.listen(3000, () => {
    console.log("listening on port 3000");
});
```

## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/koa-etag.svg?style=flat-square
[npm-url]: https://npmjs.org/package/koa-etag
[github-tag]: http://img.shields.io/github/tag/koajs/etag.svg?style=flat-square
[github-url]: https://github.com/koajs/etag/tags
[travis-image]: https://img.shields.io/travis/koajs/etag.svg?style=flat-square
[travis-url]: https://travis-ci.org/koajs/etag
[coveralls-image]: https://img.shields.io/coveralls/koajs/etag.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/koajs/etag?branch=master
[david-image]: http://img.shields.io/david/koajs/etag.svg?style=flat-square
[david-url]: https://david-dm.org/koajs/etag
[license-image]: http://img.shields.io/npm/l/koa-etag.svg?style=flat-square
[license-url]: LICENSE
[downloads-image]: http://img.shields.io/npm/dm/koa-etag.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/koa-etag
[gittip-image]: https://img.shields.io/gittip/jonathanong.svg?style=flat-square
[gittip-url]: https://www.gittip.com/jonathanong/
