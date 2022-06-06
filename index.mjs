import Stream from 'stream';
import fs from 'fs';
import calculate from 'etag';

async function concatArrayBuffer(array) {
    return Buffer.concat(array);
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
const stat = promisify(fs.stat);
async function getResponseEntity(ctx, sizelimit) {
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
                return await ReadableStreamSmallerThanLimitToBuffer(stream2, sizelimit);
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
    ctx.response.etag = calculate(entity, options);
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

export { etag as default };
//# sourceMappingURL=index.mjs.map
