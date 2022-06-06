import { Options } from "etag";
import * as koa from "koa";
declare function etag(options?: Options & {
    sizelimit?: number | undefined;
}): koa.Middleware;
export { etag as default };
