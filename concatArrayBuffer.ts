"use strict";

export async function concatArrayBuffer(
    array: Uint8Array[]
): Promise<Uint8Array> {
    return Buffer.concat(array);
}
