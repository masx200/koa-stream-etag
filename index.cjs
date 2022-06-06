'use strict';

var stream = require('stream');
var fs = require('fs');
var calculate = require('etag');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var stream__default = /*#__PURE__*/_interopDefaultLegacy(stream);
var fs__default = /*#__PURE__*/_interopDefaultLegacy(fs);
var calculate__default = /*#__PURE__*/_interopDefaultLegacy(calculate);

async function concatArrayBuffer(array) {
    return new Uint8Array(await new Blob(array).arrayBuffer());
}

async function ReadableStreamSmallerThanLimitToBuffer(readable, sizelimit) {
    const reader = readable.getReader();
    try {
        let count = 0;
        const buffers = [];
        while (true) {
            if (count > sizelimit) {
                throw new Error("stream size grater than limit");
            }
            const result = await reader.read();
            if (result.done) {
                return concatArrayBuffer(buffers);
            }
            else {
                buffers.push(result.value);
                count += result.value.length;
            }
        }
    }
    catch (error) {
        throw error;
    }
    finally {
        reader.cancel();
        reader.releaseLock();
    }
}

const promisify = require("util").promisify;
const stat = promisify(fs__default["default"].stat);
async function getResponseEntity(ctx, sizelimit) {
    const Stream = stream__default["default"].Stream;
    const body = ctx.body;
    if (!body || ctx.response.get("etag")) {
        return;
    }
    const status = (ctx.status / 100) | 0;
    if (status !== 2) {
        return;
    }
    if (body instanceof Stream) {
        if (!("path" in body)) {
            const ReadableStream = Stream.Readable.toWeb(body);
            const [stream1, stream2] = ReadableStream.tee();
            ctx.body = Stream.Readable.fromWeb(stream1);
            try {
                return Buffer.from(await ReadableStreamSmallerThanLimitToBuffer(stream2, sizelimit));
            }
            catch (error) {
                return;
            }
        }
        else {
            return await stat(body.path);
        }
    }
    else if (typeof body === "string" || Buffer.isBuffer(body)) {
        return body;
    }
    else {
        return JSON.stringify(body);
    }
}

function setEtag(ctx, entity, options) {
    if (!entity) {
        return;
    }
    ctx.response.etag = calculate__default["default"](entity, options);
}

function etag(options) {
    const sizelimit = options?.sizelimit || Default_sizelimit;
    return async function etag(ctx, next) {
        await next();
        const length = ctx.response.get("content-length");
        if (length && Number(length) > sizelimit) {
            return;
        }
        const entity = await getResponseEntity(ctx, sizelimit);
        setEtag(ctx, entity, options);
    };
}
const Default_sizelimit = 1000 * 1024;

module.exports = etag;
//# sourceMappingURL=index.cjs.map
