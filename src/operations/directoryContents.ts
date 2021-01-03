import pathPosix from "path-posix";
import { joinURL, normaliseHREF, normalisePath } from "../tools/url";
import { encodePath } from "../tools/path";
import { parseXML, prepareFileFromProps } from "../tools/dav";
import { request, prepareRequestOptions } from "../request";
import { handleResponseCode, processGlobFilter, processResponsePayload } from "../response";
import { DAVResult, FileStat, GetDirectoryContentsOptions, ResponseDataDetailed, WebDAVClientContext } from "../types";

export async function getDirectoryContents(
    remotePath: string,
    context: WebDAVClientContext,
    options: GetDirectoryContentsOptions = {}
): Promise<Array<FileStat> | ResponseDataDetailed<Array<FileStat>>> {
    const requestOptions = prepareRequestOptions({
        url: joinURL(context.remoteURL, encodePath(remotePath), "/"),
        method: "PROPFIND",
        headers: {
            Accept: "text/plain",
            Depth: options.deep ? "infinity" : "1"
        },
        responseType: "text"
    }, context);
    const response = await request(requestOptions);
    handleResponseCode(response);
    const davResp = await parseXML(response.data as string);
    let files = getDirectoryFiles(davResp, context.remotePath, remotePath, options.details);
    if (options.glob) {
        files = processGlobFilter(files, options.glob);
    }
    return processResponsePayload(response, files, options.details);
}

function getDirectoryFiles(result: DAVResult, serverBasePath: string, requestPath: string, isDetailed: boolean = false): Array<FileStat> {
    const serverBase = pathPosix.join(serverBasePath, "/");
    // Extract the response items (directory contents)
    const {
        multistatus: { response: responseItems }
    } = result;
    return (
        responseItems
            // Map all items to a consistent output structure (results)
            .map(item => {
                // HREF is the file path (in full)
                const href = normaliseHREF(item.href);
                // Each item should contain a stat object
                const {
                    propstat: { prop: props }
                } = item;
                // Process the true full filename (minus the base server path)
                const filename =
                    serverBase === "/"
                        ? decodeURIComponent(normalisePath(href))
                        : decodeURIComponent(normalisePath(pathPosix.relative(serverBase, href)));
                return prepareFileFromProps(props, filename, isDetailed);
            })
            // Filter out the item pointing to the current directory (not needed)
            .filter(item => item.basename && (item.type === "file" || item.filename !== requestPath.replace(/\/$/, "")))
    );
}
