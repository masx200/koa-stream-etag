"use strict";

/**
 * Module dependencies.
 */

const calculate = require("etag");
const Stream = require("stream");
const promisify = require("util").promisify;
const fs = require("fs");

const stat = promisify(fs.stat);

/**
 * Expose `etag`.
 *
 * Add ETag header field.
 * @param {object} [options] see https://github.com/jshttp/etag#options
 * @param {boolean} [options.weak]
 * @param {number} [options.sizelimit]
 * @return {Function}
 * @api public
 */

module.exports = function etag(options) {
    return async function etag(ctx, next) {
        await next();
        const entity = await getResponseEntity(
            ctx,
            options?.sizelimit || sizelimit
        );
        setEtag(ctx, entity, options);
    };
};
const sizelimit = 100 * 1024;
/**
 * @param {Stream} stream
 * @param { number} sizelimit
 */
function streamToBufferandisnotlarger(stream, sizelimit) {
    return new Promise((resolve, reject) => {
        let length = 0;

        let buffers = [];
        stream.on("error", reject);
        stream.on("data", (data) => {
            buffers.push(data);

            length += data.length;
            if (length > sizelimit) {
                reject(new Error("stream larger than sizelimit:" + sizelimit));
            }
        });
        stream.on("end", () => {
            resolve(Buffer.concat(buffers));
        });
    });
}
async function getResponseEntity(ctx, sizelimit) {
    // no body
    const body = ctx.body;
    if (!body || ctx.response.get("etag")) return;

    // type
    const status = (ctx.status / 100) | 0;

    // 2xx
    if (status !== 2) return;

    if (body instanceof Stream) {
        if (!body.path) {
            var tmpstream = new Stream.Transform({
                transform(chunk, encoding, callback) {
                    // console.log(chunk.toString(), encoding);
                    callback(null, chunk);
                },
            });

            ctx.body = tmpstream;
            body.pipe(tmpstream);
            var tmpbuf;
            try {
                var tmpbuf = await streamToBufferandisnotlarger(
                    body,
                    sizelimit
                );
                return tmpbuf;
            } catch (error) {
                // console.error(error);
                return;
            }
        }
        return await stat(body.path);
    } else if (typeof body === "string" || Buffer.isBuffer(body)) {
        return body;
    } else {
        return JSON.stringify(body);
    }
}

function setEtag(ctx, entity, options) {
    if (!entity) return;

    ctx.response.etag = calculate(entity, options);
}
