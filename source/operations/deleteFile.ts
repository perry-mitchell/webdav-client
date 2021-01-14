import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode, } from "../response";
import { WebDAVClientContext } from "../types";

export async function deleteFile(context: WebDAVClientContext, filename: string): Promise<void> {
    const requestOptions = prepareRequestOptions({
        url: joinURL(context.remoteURL, encodePath(filename)),
        method: "DELETE"
    }, context);
    const response = await request(requestOptions);
    handleResponseCode(response);
}
