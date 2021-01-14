import { getStat } from "./stat";
import { WebDAVClientContext } from "../types";

export async function exists(context: WebDAVClientContext, remotePath: string): Promise<boolean> {
    try {
        await getStat(context, remotePath);
        return true;
    } catch (err) {
        if (err.response && err.response.status === 404) {
            return false;
        }
        throw err;
    }
}
