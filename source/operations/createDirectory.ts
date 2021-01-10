import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode } from "../response";
import { WebDAVClientContext } from "../types";

export async function createDirectory(context: WebDAVClientContext, dirPath: string) {
    const requestOptions = prepareRequestOptions({
        url: joinURL(context.remoteURL, encodePath(dirPath)),
        method: "MKCOL"
    }, context);
    const response = await request(requestOptions);
    handleResponseCode(response);
}
