import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode } from "../response";
import { WebDAVClientContext, WebDAVMethodOptions } from "../types";

export async function createDirectory(
    context: WebDAVClientContext,
    dirPath: string,
    options: WebDAVMethodOptions = {}
): Promise<void> {
    const requestOptions = prepareRequestOptions({
        url: joinURL(context.remoteURL, encodePath(dirPath)),
        method: "MKCOL"
    }, context, options);
    const response = await request(requestOptions);
    handleResponseCode(response);
}
