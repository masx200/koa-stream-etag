"use strict";
import calculate from "etag";
import * as koa from "koa";

export function setEtag(
    ctx: koa.ParameterizedContext<koa.DefaultState, koa.DefaultContext, any>,
    entity: string | Buffer | calculate.StatsLike | undefined,
    options: calculate.Options | undefined
) {
    if (!entity) {
        return;
    }

    ctx.response.etag = calculate(entity, options);
}
