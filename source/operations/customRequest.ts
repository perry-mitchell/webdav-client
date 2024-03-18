import { joinURL } from "../tools/url.js";
import { encodePath } from "../tools/path.js";
import { request, prepareRequestOptions } from "../request.js";
import { handleResponseCode } from "../response.js";
import { RequestOptionsCustom, Response, WebDAVClientContext } from "../types.js";

export async function customRequest(
    context: WebDAVClientContext,
    remotePath: string,
    requestOptions: RequestOptionsCustom
): Promise<Response> {
    if (!requestOptions.url) {
        requestOptions.url = joinURL(context.remoteURL, encodePath(remotePath));
    }
    const finalOptions = prepareRequestOptions(requestOptions, context, {});
    const response = await request(finalOptions, context);
    handleResponseCode(context, response);
    return response;
}
