import { prepareRequestOptions, request } from "../request.js";
import { handleResponseCode, processResponsePayload } from "../response.js";
import { parseXML } from "../tools/dav.js";
import { joinURL } from "../tools/url.js";
import { parseQuota } from "../tools/quota.js";
import { DiskQuota, GetQuotaOptions, ResponseDataDetailed, WebDAVClientContext } from "../types.js";

export async function getQuota(
    context: WebDAVClientContext,
    options: GetQuotaOptions = {}
): Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>> {
    const path = options.path || "/";
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, path),
            method: "PROPFIND",
            headers: {
                Accept: "text/plain",
                Depth: "0"
            },
            responseType: "text"
        },
        context,
        options
    );
    const response = await request(requestOptions);
    handleResponseCode(context, response);
    const result = await parseXML(response.data as string);
    const quota = parseQuota(result);
    return processResponsePayload(response, quota, options.details);
}
