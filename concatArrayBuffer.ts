"use strict";

export async function concatArrayBuffer(
    array: Uint8Array[]
): Promise<Uint8Array> {
    return new Uint8Array(await new Blob(array).arrayBuffer());
}
