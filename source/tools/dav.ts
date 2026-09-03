import path from "path-posix";
import { XMLParser } from "fast-xml-parser";
// @ts-expect-error Types declare default export but runtime provides named export
import { EntityDecoder } from "@nodable/entities";
import nestedProp from "nested-property";
import { encodePath, normalisePath } from "./path.js";
import type {
    DAVResult,
    DAVResultPropstatResponse,
    DAVResultRaw,
    DAVResultResponse,
    DAVResultResponseProps,
    DiskQuotaAvailable,
    FileStat,
    SearchResult,
    WebDAVClientError,
    WebDAVParsingContext
} from "../types.ts";

enum PropertyType {
    Array = "array",
    Object = "object",
    Original = "original"
}

type JPath = string | { toArray: () => string[] };

function stripPrefix(name: string): string {
    const colonIdx = name.indexOf(":");
    return colonIdx === -1 ? name : name.slice(colonIdx + 1);
}

function isXmlnsAttribute(name: string): boolean {
    return name === "xmlns" || name.startsWith("xmlns:");
}

// The parser only keeps namespace prefixes on tags in Clark mode, so without
// this the jPaths would be `d:propstat.d:prop.d:displayname` there and bare
// everywhere else. Strip per segment (rather than off the joined path) as
// prefixes and local names may both contain dots.
function toJPathString(jPath: JPath): string {
    if (typeof jPath === "string") {
        return jPath;
    }
    return jPath.toArray().map(stripPrefix).join(".");
}

function getParser({
    attributeNamePrefix,
    attributeParsers,
    clarkNotationProps,
    entityDecoder: entityDecoderOptions,
    tagParsers
}: WebDAVParsingContext): XMLParser {
    const parserOptions: Record<string, unknown> = {
        allowBooleanAttributes: true,
        attributeNamePrefix,
        textNodeName: "text",
        ignoreAttributes: false,
        removeNSPrefix: !clarkNotationProps,
        jPath: false,
        numberParseOptions: {
            hex: true,
            leadingZeros: false
        },
        attributeValueProcessor(attrName, attrValue, jPath) {
            // Clark mode keeps the namespace declarations, which the default
            // mode discards. They are consumed by the walker and removed from
            // the result, so parsers never get to see them in either mode.
            if (attributeParsers.length === 0 || isXmlnsAttribute(attrName)) {
                return attrValue;
            }
            const pathStr = toJPathString(jPath);
            for (const processor of attributeParsers) {
                try {
                    const value = processor(pathStr, attrValue);
                    if (value !== attrValue) {
                        return value;
                    }
                } catch (error) {
                    // skipping this invalid processor
                }
            }
            return attrValue;
        },
        tagValueProcessor(tagName, tagValue, jPath) {
            if (tagParsers.length === 0) {
                return tagValue;
            }
            const pathStr = toJPathString(jPath);
            for (const processor of tagParsers) {
                try {
                    const value = processor(pathStr, tagValue);
                    if (value !== tagValue) {
                        return value;
                    }
                } catch (error) {
                    // skipping this invalid processor
                }
            }
            return tagValue;
        }
    };
    if (entityDecoderOptions) {
        parserOptions.entityDecoder = new EntityDecoder({
            limit: {
                maxTotalExpansions: entityDecoderOptions.limit?.maxTotalExpansions ?? 0,
                maxExpandedLength: entityDecoderOptions.limit?.maxExpandedLength ?? 0
            }
        });
    }
    return new XMLParser(parserOptions);
}

/**
 * Tag parser for the displayname prop.
 * Ensure that the displayname is not parsed and always handled as is.
 * @param path The jPath of the tag
 * @param value The text value of the tag
 */
export function displaynameTagParser(path: string, value: string): string | void {
    if (path.endsWith("propstat.prop.displayname")) {
        // Do not parse the displayname, because this causes e.g. '2024.10' to result in number 2024.1
        return;
    }
    return value;
}

function getPropertyOfType(
    obj: Object,
    prop: string,
    type: PropertyType = PropertyType.Original
): any {
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
    // Only either status OR propstat is allowed
    if (output.status) {
        nestedProp.set(output, "status", getPropertyOfType(output, "status", PropertyType.Object));
    } else {
        nestedProp.set(
            output,
            "propstat",
            getPropertyOfType(output, "propstat", PropertyType.Object)
        );
        nestedProp.set(
            output,
            "propstat.prop",
            getPropertyOfType(output, "propstat.prop", PropertyType.Object)
        );
    }
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
    nestedProp.set(
        output,
        "multistatus.response",
        getPropertyOfType(output, "multistatus.response", PropertyType.Array)
    );
    nestedProp.set(
        output,
        "multistatus.response",
        nestedProp.get(output, "multistatus.response").map(response => normaliseResponse(response))
    );
    return output as DAVResult;
}

// Structural keys of the WebDAV multistatus envelope (RFC 4918). When
// `clarkNotationProps` is enabled the parser keeps namespace prefixes on
// every tag, so these structural keys arrive prefixed (e.g. `d:multistatus`)
// and have to be renamed back to their bare local name so the existing
// `normaliseResult` continues to work and `DAVResult` keeps its shape.
//
// Keep this list in sync with the structural fields exposed on `DAVResult`,
// `DAVResultResponse`, `DAVResultPropstatResponse`, `DAVResultStatusResponse`
// and `DAVPropStat` in `source/types.ts`. If a new structural field is added
// to those interfaces, it must be added here too or the prefixed variant
// will leak through into the result.
const STRUCTURAL_KEYS = new Set([
    "multistatus",
    "response",
    "propstat",
    "prop",
    "status",
    "href",
    "responsedescription"
]);

function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Transform a parsed (prefix-preserving) tree in place to:
 *
 *  1. Rename structural keys (`multistatus`/`response`/...) back to their
 *     bare local names so `DAVResult`'s shape is preserved.
 *  2. Rewrite every key inside each `<prop>` to Clark notation
 *     `{namespaceURI}localName`, resolving the namespace against the xmlns
 *     scope built up along the way (declarations on any of the enclosing
 *     elements as well as on the property element itself). A property whose
 *     prefix has no URI in scope keeps its bare local name.
 *  3. Drop the xmlns declarations once they are resolved, so the result
 *     carries the same shape the default (prefix-stripping) mode produces.
 *
 * Only the direct children of `<prop>` are rewritten: the keys of any
 * nested elements below them are left alone and keep whichever prefix the
 * server serialised them with.
 */
function applyClarkNotation(root: unknown, attrPrefix: string): void {
    if (!isPlainObject(root) && !Array.isArray(root)) return;

    const xmlnsKey = `${attrPrefix}xmlns`;
    const xmlnsPrefixedKey = `${xmlnsKey}:`;
    const xmlnsPrefixedKeyLen = xmlnsPrefixedKey.length;
    const TEXT_KEY = "text";
    const EMPTY_SCOPE: Map<string, string> = new Map();

    function isXmlnsAttr(key: string): boolean {
        return (
            key === xmlnsKey ||
            (key.length > xmlnsPrefixedKeyLen && key.startsWith(xmlnsPrefixedKey))
        );
    }

    // Return an extended scope if `obj` declares any xmlns; otherwise reuse
    // the parent scope to avoid allocating a Map for every node.
    function extendScope(
        obj: Record<string, unknown>,
        parent: Map<string, string>
    ): Map<string, string> {
        let scope: Map<string, string> | null = null;
        for (const key of Object.keys(obj)) {
            if (key === xmlnsKey) {
                if (!scope) scope = new Map(parent);
                scope.set("", obj[key] as string);
            } else if (key.length > xmlnsPrefixedKeyLen && key.startsWith(xmlnsPrefixedKey)) {
                if (!scope) scope = new Map(parent);
                scope.set(key.slice(xmlnsPrefixedKeyLen), obj[key] as string);
            }
        }
        return scope ?? parent;
    }

    // Drop the namespace declarations once they have been resolved, so a prop
    // value ends up with the same shape it has in the default (prefix-
    // stripping) mode: bare text for a simple element, an empty string for an
    // empty one, and `{ text, "@attr" }` for one carrying other attributes.
    // The keys of nested children are NOT rewritten to Clark notation, since
    // the walker only resolves namespaces at the `<prop>` child level; those
    // keep the prefix the server happened to serialise them with.
    function cleanPropValue(raw: unknown): unknown {
        if (Array.isArray(raw)) return raw.map(cleanPropValue);
        if (!isPlainObject(raw)) return raw;
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(raw)) {
            if (isXmlnsAttr(key)) continue;
            out[key] = cleanPropValue(raw[key]);
        }
        const keys = Object.keys(out);
        if (keys.length === 0) return "";
        if (keys.length === 1 && keys[0] === TEXT_KEY) return out[TEXT_KEY];
        return out;
    }

    function emitClarkForChild(
        rawKey: string,
        rawValue: unknown,
        scope: Map<string, string>,
        out: Record<string, unknown>
    ): void {
        const colonIdx = rawKey.indexOf(":");
        const prefix = colonIdx === -1 ? "" : rawKey.slice(0, colonIdx);
        const local = colonIdx === -1 ? rawKey : rawKey.slice(colonIdx + 1);

        // A property element may declare its own namespaces, either as a
        // default `xmlns="..."` or bound to the very prefix it uses, so its
        // attributes have to be folded into the scope before resolving. A
        // prefix with no URI in scope falls back to the null namespace; that
        // yields a bare `local` key rather than throwing or losing the data.
        const resolveNs = (value: unknown): string => {
            const ownScope = isPlainObject(value) ? extendScope(value, scope) : scope;
            return ownScope.get(prefix) ?? "";
        };

        const assign = (ns: string, value: unknown): void => {
            const key = ns ? `{${ns}}${local}` : local;
            const existing = out[key];
            if (existing === undefined) {
                out[key] = value;
            } else if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                out[key] = [existing, value];
            }
        };

        if (Array.isArray(rawValue)) {
            for (const item of rawValue) {
                assign(resolveNs(item), cleanPropValue(item));
            }
            return;
        }

        assign(resolveNs(rawValue), cleanPropValue(rawValue));
    }

    function rewritePropToClark(
        propObj: Record<string, unknown>,
        parentScope: Map<string, string>
    ): Record<string, unknown> {
        const scope = extendScope(propObj, parentScope);
        const out: Record<string, unknown> = {};
        for (const key of Object.keys(propObj)) {
            if (isXmlnsAttr(key)) continue;
            emitClarkForChild(key, propObj[key], scope, out);
        }
        return out;
    }

    function rewriteProp(value: unknown, parentScope: Map<string, string>): unknown {
        if (!isPlainObject(value)) return value;
        const rewritten = rewritePropToClark(value, parentScope);
        return Object.keys(rewritten).length === 0 ? "" : rewritten;
    }

    // Returns the (possibly replaced) node, so that an element left empty by
    // dropping its namespace declarations collapses to the empty string the
    // default mode would have produced for it.
    function walk(node: unknown, scope: Map<string, string>): unknown {
        if (Array.isArray(node)) {
            for (let index = 0; index < node.length; index += 1) {
                node[index] = walk(node[index], scope);
            }
            return node;
        }
        if (!isPlainObject(node)) return node;

        const childScope = extendScope(node, scope);

        for (const key of Object.keys(node)) {
            // The declarations have been folded into the scope above and are
            // of no further use; the default mode discards them as well.
            if (isXmlnsAttr(key)) {
                delete node[key];
                continue;
            }

            const colonIdx = key.indexOf(":");
            const ln = colonIdx === -1 ? key : key.slice(colonIdx + 1);
            const value = node[key];

            // Rename structural keys to bare local name.
            let actualKey = key;
            if (STRUCTURAL_KEYS.has(ln) && ln !== key) {
                delete node[key];
                node[ln] = value;
                actualKey = ln;
            }

            if (ln === "prop") {
                node[actualKey] = Array.isArray(value)
                    ? value.map(item => rewriteProp(item, childScope))
                    : rewriteProp(value, childScope);
                // Stop here; the prop content was rewritten in one shot.
            } else {
                node[actualKey] = walk(value, childScope);
            }
        }

        return Object.keys(node).length === 0 ? "" : node;
    }

    walk(root, EMPTY_SCOPE);
}

/**
 * Parse an XML response from a WebDAV service, converting it to an internal
 * DAV result.
 *
 * When `context.clarkNotationProps` is `true`, every property key inside
 * each `propstat.prop` is rewritten to Clark notation
 * `{namespaceURI}localName`. This lets consumers disambiguate properties
 * that share a local name across different XML namespaces (RFC 4918) and
 * uses a single canonical key per property regardless of how the server
 * serialised the namespace (prefix or inline default xmlns).
 *
 * The structural shape of `DAVResult` (`multistatus`/`response`/`propstat`/
 * `prop`/`status`/`href`) is unaffected by this option; only the keys
 * inside each `propstat.prop` change, and only for the direct children of
 * `<prop>` (nested elements keep the prefix the server used). Downstream
 * helpers like `prepareFileFromProps`, `parseStat` and `parseSearch` assume
 * bare prop keys and will not work with Clark-notation ones; consumers that
 * opt in are expected to address the Clark keys on their side.
 *
 * `context.tagParsers` and `context.attributeParsers` are unaffected as
 * well: they are handed the same jPaths, without namespace prefixes, and
 * are not invoked for the xmlns declarations in either mode.
 *
 * @param xml The raw XML string
 * @param context The current client context
 * @returns A parsed and processed DAV result
 */
export function parseXML(xml: string, context?: WebDAVParsingContext): Promise<DAVResult> {
    // backwards compatibility as this method is exported from the package
    context = context ?? {
        attributeNamePrefix: "@",
        attributeParsers: [],
        tagParsers: [displaynameTagParser]
    };
    return new Promise(resolve => {
        const result = getParser(context).parse(xml);
        if (context.clarkNotationProps) {
            applyClarkNotation(result, context.attributeNamePrefix ?? "@");
        }
        resolve(normaliseResult(result));
    });
}

/**
 * Get a file stat result from given DAV properties
 * @param props DAV properties
 * @param filename The filename for the file stat
 * @param isDetailed Whether or not the raw props of the resource should be returned
 * @returns A file stat result
 */
export function prepareFileFromProps(
    props: DAVResultResponseProps,
    filename: string,
    isDetailed: boolean = false
): FileStat {
    // Last modified time, raw size, item type and mime
    const {
        getlastmodified: lastMod = null,
        getcontentlength: rawSize = "0",
        resourcetype: resourceType = null,
        getcontenttype: mimeType = null,
        getetag: etag = null
    } = props;
    const type =
        resourceType &&
        typeof resourceType === "object" &&
        typeof resourceType.collection !== "undefined"
            ? "directory"
            : "file";
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
        // The XML parser tries to interpret values, but the display name is required to be a string
        if (typeof props.displayname !== "undefined") {
            props.displayname = String(props.displayname);
        }
        stat.props = props;
    }
    return stat;
}

/**
 * Parse a DAV result for file stats
 * @param result The resulting DAV response
 * @param filename The filename that was stat'd
 * @param isDetailed Whether or not the raw props of
 *  the resource should be returned
 * @returns A file stat result
 */
export function parseStat(
    result: DAVResult,
    filename: string,
    isDetailed: boolean = false
): FileStat {
    let responseItem: DAVResultPropstatResponse = null;
    try {
        // should be a propstat response, if not the if below will throw an error
        if ((result.multistatus.response[0] as DAVResultPropstatResponse).propstat) {
            responseItem = result.multistatus.response[0] as DAVResultPropstatResponse;
        }
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
    const [_, statusCodeStr, statusText] = statusLine.split(" ", 3);
    const statusCode = parseInt(statusCodeStr, 10);
    if (statusCode >= 400) {
        const err: WebDAVClientError = new Error(
            `Invalid response: ${statusCode} ${statusText}`
        ) as WebDAVClientError;
        err.status = statusCode;
        throw err;
    }

    const filePath = normalisePath(filename);
    return prepareFileFromProps(props, filePath, isDetailed);
}

/**
 * Parse a DAV result for a search request
 *
 * @param result The resulting DAV response
 * @param searchArbiter The collection path that was searched
 * @param isDetailed Whether or not the raw props of the resource should be returned
 */
export function parseSearch(result: DAVResult, searchArbiter: string, isDetailed: boolean) {
    const response: SearchResult = {
        truncated: false,
        results: []
    };

    response.truncated = result.multistatus.response.some(v => {
        return (
            (v.status || v.propstat?.status).split(" ", 3)?.[1] === "507" &&
            v.href.replace(/\/$/, "").endsWith(encodePath(searchArbiter).replace(/\/$/, ""))
        );
    });

    result.multistatus.response.forEach(result => {
        if (result.propstat === undefined) {
            return;
        }
        const filename = result.href.split("/").map(decodeURIComponent).join("/");
        response.results.push(prepareFileFromProps(result.propstat.prop, filename, isDetailed));
    });

    return response;
}

/**
 * Translate a disk quota indicator to a recognised
 *  value (includes "unlimited" and "unknown")
 * @param value The quota indicator, eg. "-3"
 * @returns The value in bytes, or another indicator
 */
export function translateDiskSpace(value: string | number): DiskQuotaAvailable {
    switch (String(value)) {
        case "-3":
            return "unlimited";
        case "-2":
        /* falls-through */
        case "-1":
            // -1 is non-computed
            return "unknown";
        default:
            return parseInt(String(value), 10);
    }
}
