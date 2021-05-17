import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode } from "../response";
import { WebDAVClientContext, WebDAVMethodOptions } from "../types";

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
