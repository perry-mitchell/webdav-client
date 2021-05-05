import path from "path-posix";
import xmlParser from "fast-xml-parser";
import nestedProp from "nested-property";
import { decodeHTMLEntities } from "./encode";
import { normalisePath } from "./path";
import {
    DAVResult,
    DAVResultRaw,
    DAVResultResponse,
    DAVResultResponseProps,
    DiskQuotaAvailable,
    FileStat,
    WebDAVClientError
} from "../types";

enum PropertyType {
    Array = "array",
    Object = "object",
    Original = "original"
}

function getPropertyOfType(obj: Object, prop: string, type: PropertyType = PropertyType.Original): any {
    const val = nestedProp.get(obj, prop);
    if (type === "array" && Array.isArray(val) === false) {
        return [val];
    } else if (type === "object" && Array.isArray(val)) {
        return val[0];
    }
    return val;
}

function normaliseResponse(response: any): DAVResultResponse {
    const output = Object.assign({}, response);
    nestedProp.set(output, "propstat", getPropertyOfType(output, "propstat", PropertyType.Object));
    nestedProp.set(output, "propstat.prop", getPropertyOfType(output, "propstat.prop", PropertyType.Object));
    return output;
}

function normaliseResult(result: DAVResultRaw): DAVResult {
    const { multistatus } = result;
    if (multistatus === "") {
        return {
            multistatus: {
                response: []
            }
        };
    }
    if (!multistatus) {
        throw new Error("Invalid response: No root multistatus found");
    }
    const output: any = {
        multistatus: Array.isArray(multistatus) ? multistatus[0] : multistatus
    };
    nestedProp.set(output, "multistatus.response", getPropertyOfType(output, "multistatus.response", PropertyType.Array));
    nestedProp.set(
        output,
        "multistatus.response",
        nestedProp.get(output, "multistatus.response").map(response => normaliseResponse(response))
    );
    return output as DAVResult;
}

export function parseXML(xml: string): Promise<DAVResult> {
    return new Promise(resolve => {
        const result = xmlParser.parse(xml, {
            arrayMode: false,
            ignoreNameSpace: true
            // // We don't use the processors here as decoding is done manually
            // // later on - decoding early would break some path checks.
            // attrValueProcessor: val => decodeHTMLEntities(decodeURIComponent(val)),
            // tagValueProcessor: val => decodeHTMLEntities(decodeURIComponent(val))
        });
        resolve(normaliseResult(result));
    });
}

export function prepareFileFromProps(props: DAVResultResponseProps, rawFilename: string, isDetailed: boolean = false): FileStat {
    // Last modified time, raw size, item type and mime
    const {
        getlastmodified: lastMod = null,
        getcontentlength: rawSize = "0",
        resourcetype: resourceType = null,
        getcontenttype: mimeType = null,
        getetag: etag = null
    } = props;
    const type =
        resourceType && typeof resourceType === "object" && typeof resourceType.collection !== "undefined"
            ? "directory"
            : "file";
    const filename = decodeHTMLEntities(rawFilename);
    const stat: FileStat = {
        filename,
        basename: path.basename(filename),
        lastmod: lastMod,
        size: parseInt(rawSize, 10),
        type,
        etag: typeof etag === "string" ? etag.replace(/"/g, "") : null
    };
    if (type === "file") {
        stat.mime = mimeType && typeof mimeType === "string" ? mimeType.split(";")[0] : "";
    }
    if (isDetailed) {
        stat.props = props;
    }
    return stat;
}

export function parseStat(result: DAVResult, filename: string, isDetailed: boolean = false): FileStat {
    let responseItem: DAVResultResponse = null;
    try {
        responseItem = result.multistatus.response[0];
    } catch (e) {
        /* ignore */
    }
    if (!responseItem) {
        throw new Error("Failed getting item stat: bad response");
    }
    const {
        propstat: { prop: props, status: statusLine }
    } = responseItem;

    // As defined in https://tools.ietf.org/html/rfc2068#section-6.1
    const [_, statusCodeStr, statusText] = statusLine.split(' ', 3);
    const statusCode = parseInt(statusCodeStr, 10);
    if (statusCode >= 400) {
        const err: WebDAVClientError = new Error(`Invalid response: ${statusCode} ${statusText}`) as WebDAVClientError;
        err.status = statusCode;
        throw err;
    }

    const filePath = normalisePath(filename);
    return prepareFileFromProps(props, filePath, isDetailed);
}

export function translateDiskSpace(value: string | number): DiskQuotaAvailable {
    switch (value.toString()) {
        case "-3":
            return "unlimited";
        case "-2":
        /* falls-through */
        case "-1":
            // -1 is non-computed
            return "unknown";
        default:
            return parseInt(value as string, 10);
    }
}
