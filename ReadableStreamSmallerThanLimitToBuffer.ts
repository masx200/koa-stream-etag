"use strict";

import { concatArrayBuffer } from "./concatArrayBuffer";

export async function ReadableStreamSmallerThanLimitToBuffer(
    readable: ReadableStream<Uint8Array>,
    sizelimit: number
): Promise<Uint8Array> {
    const reader = readable.getReader();
    try {
        let count = 0;
        const buffers: Uint8Array[] = [];
        while (true) {
            if (count > sizelimit) {
                throw new Error("stream size grater than limit");
            }
            const result = await reader.read();

            if (result.done) {
                return concatArrayBuffer(buffers);
            } else {
                buffers.push(result.value);
                count += result.value.length;
            }
        }
    } catch (error) {
        throw error;
    } finally {
        reader.cancel();
        reader.releaseLock();
    }
}
