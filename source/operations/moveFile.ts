import { joinURL } from "../tools/url.js";
import { encodePath } from "../tools/path.js";
import { request, prepareRequestOptions } from "../request.js";
import { handleResponseCode } from "../response.js";
import { WebDAVClientContext, WebDAVMethodOptions } from "../types.js";

export async function moveFile(
    context: WebDAVClientContext,
    filename: string,
    destination: string,
    options: WebDAVMethodOptions = {}
): Promise<void> {
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(filename)),
            method: "MOVE",
            headers: {
                Destination: joinURL(context.remoteURL, encodePath(destination))
            }
        },
        context,
        options
    );
    const response = await request(requestOptions);
    handleResponseCode(context, response);
}
