import { getStat } from "./stat.js";
import { WebDAVClientContext, WebDAVMethodOptions } from "../types.js";

export async function exists(
    context: WebDAVClientContext,
    remotePath: string,
    options: WebDAVMethodOptions = {}
): Promise<boolean> {
    try {
        await getStat(context, remotePath, options);
        return true;
    } catch (err) {
        if (err.status === 404) {
            return false;
        }
        throw err;
    }
}
