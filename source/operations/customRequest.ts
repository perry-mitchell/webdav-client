import { joinURL } from "../tools/url";
import { encodePath } from "../tools/path";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode } from "../response";
import { RequestOptionsCustom, Response, WebDAVClientContext } from "../types";

export async function customRequest(
    context: WebDAVClientContext,
    remotePath: string,
    requestOptions: RequestOptionsCustom
): Promise<Response> {
    if (!requestOptions.url) {
        requestOptions.url = joinURL(context.remoteURL, encodePath(remotePath));
    }
    const finalOptions = prepareRequestOptions(requestOptions, context, {});
    const response = await request(finalOptions);
    handleResponseCode(response);
    return response;
}
