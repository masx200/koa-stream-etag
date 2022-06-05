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
    return async function etag(
        /** @type {{ body?: Stream.Transform; response: { get: (arg0: string) => any; } | { etag: string; }; status?: number; }} */ ctx,
        /** @type {() => any} */ next
    ) {
        await next();
        const length = ctx.response.get("content-length");
        if (length && Number(length) > sizelimit) {
            return;
        }
        const entity = await getResponseEntity(
            ctx,
            (options && options.sizelimit) || sizelimit
        );
        setEtag(ctx, entity, options);
    };
};
const sizelimit = 1000 * 1024;
/**
 * @param {Stream} stream
 * @param {number} sizelimit
 * @param {Stream.Writable} output
 */
function streamToBufferandisnotlarger(stream, sizelimit, output) {
    return new Promise((resolve, reject) => {
        let fail = false;
        let length = 0;

        /**
         * @type { Uint8Array[]}
         */
        let buffers = [];
        stream.on("error", (e) => {
            reject(e);
            fail = true;
        });
        stream.on("data", (data) => {
            //console.log(fail);
            if (fail) {
                return;
            }
            buffers.push(data);

            length += data.length;
            if (length > sizelimit) {
                reject(new Error("stream larger than sizelimit:" + sizelimit));
                fail = true;
            }
        });
        stream.on("end", () => {
output.end()
            //console.log(fail);
            if (fail) {
                return;
            }
            resolve(Buffer.concat(buffers));
        });
        stream.pipe(output);
    });
}
/**
 * @param {{ body?: Stream.Transform; response: { get: (arg0: string) => any; }; status: number; }} ctx
 * @param {number} sizelimit
 */
async function getResponseEntity(ctx, sizelimit) {
    // no body
    const body = ctx.body;
    if (!body || ctx.response.get("etag")) {
        return;
    }

    // type
    const status = (ctx.status / 100) | 0;

    // 2xx
    if (status !== 2) {
        return;
    }

    if (body instanceof Stream) {
        if (!("path" in body)) {
            var tmpstream = new Stream.Transform({
                writableHighWaterMark: sizelimit,
                transform(chunk, encoding, callback) {
                    // console.log(chunk.toString(), encoding);
                    callback(null, chunk);
                },flush(callback){callback()}
            });

            ctx.body = tmpstream;
            // body.pipe(tmpstream);
            var tmpbuf;
            try {
                tmpbuf = await streamToBufferandisnotlarger(
                    body,
                    sizelimit,
                    tmpstream
                );
                return tmpbuf;
            } catch (error) {
                // console.error(error);
                return;
            }
        } else {
            // @ts-ignore
            return await stat(body.path);
        }
    } else if (typeof body === "string" || Buffer.isBuffer(body)) {
        return body;
    } else {
        return JSON.stringify(body);
    }
}

/**
 * @param {{ response: { etag: string; }; }} ctx
 * @param {string | Buffer | calculate.StatsLike} entity
 * @param {{ weak?: boolean | undefined; sizelimit?: number | undefined; } | calculate.Options | undefined} options
 */
function setEtag(ctx, entity, options) {
    if (!entity) {
        return;
    }

    ctx.response.etag = calculate(entity, options);
}
