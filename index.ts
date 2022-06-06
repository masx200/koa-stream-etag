"use strict";

/**
 * Module dependencies.
 */

import type { Options } from "etag";
import * as koa from "koa";
import { getResponseEntity } from "./getResponseEntity";
import { setEtag } from "./setEtag";

export default function etag(
    options?: Options & { sizelimit?: number | undefined }
): koa.Middleware {
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
