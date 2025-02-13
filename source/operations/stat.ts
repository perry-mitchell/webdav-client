import { parseStat, parseXML } from "../tools/dav.js";
import { joinURL } from "../tools/url.js";
import { encodePath } from "../tools/path.js";
import { request, prepareRequestOptions } from "../request.js";
import { handleResponseCode, processResponsePayload } from "../response.js";
import { FileStat, ResponseDataDetailed, StatOptions, WebDAVClientContext } from "../types.js";

export async function getStat(
    context: WebDAVClientContext,
    filename: string,
    options: StatOptions = {}
): Promise<FileStat | ResponseDataDetailed<FileStat>> {
    const { details: isDetailed = false } = options;
    const requestOptions = prepareRequestOptions(
        {
            url: joinURL(context.remoteURL, encodePath(filename)),
            method: "PROPFIND",
            headers: {
                Accept: "text/plain,application/xml",
                Depth: "0"
            }
        },
        context,
        options
    );
    const response = await request(requestOptions, context);
    handleResponseCode(context, response);
    const responseData = await response.text();
    const result = await parseXML(responseData, context.parsing);
    const stat = parseStat(result, filename, isDetailed);
    return processResponsePayload(response, stat, isDetailed);
}
