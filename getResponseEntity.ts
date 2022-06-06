"use strict";
import Stream from "stream";
import * as koa from "koa";
import { ReadableStreamSmallerThanLimitToBuffer } from "./ReadableStreamSmallerThanLimitToBuffer";

const promisify = require("util").promisify;
export const stat = promisify(fs.stat);
import fs from "fs";
export async function getResponseEntity(
    ctx: koa.ParameterizedContext<koa.DefaultState, koa.DefaultContext, any>,
    sizelimit: number
) {
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
            //@ts-ignore
            const ReadableStream = Stream.Readable.toWeb(body);
            const [stream1, stream2] = ReadableStream.tee();
            //@ts-ignore
            ctx.body = Stream.Readable.fromWeb(stream1);

            try {
                return await ReadableStreamSmallerThanLimitToBuffer(
                    stream2,
                    sizelimit
                );
            } catch (error) {
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
