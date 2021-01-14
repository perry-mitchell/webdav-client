import { prepareRequestOptions, request } from "../request";
import { handleResponseCode, processResponsePayload } from "../response";
import { parseXML } from "../tools/dav";
import { joinURL } from "../tools/url";
import { parseQuota } from "../tools/quota";
import { DiskQuota, GetQuotaOptions, ResponseDataDetailed, WebDAVClientContext } from "../types";

export async function getQuota(
    context: WebDAVClientContext,
    options: GetQuotaOptions = {}
): Promise<DiskQuota | null | ResponseDataDetailed<DiskQuota | null>> {
    const requestOptions = prepareRequestOptions({
        url: joinURL(context.remoteURL, "/"),
        method: "PROPFIND",
        headers: {
            Accept: "text/plain",
            Depth: "0"
        },
        responseType: "text"
    }, context);
    const response = await request(requestOptions);
    handleResponseCode(response);
    const result = await parseXML(response.data as string);
    const quota = parseQuota(result);
    return processResponsePayload(response, quota, options.details);
}
