import xmlParser, { j2xParser as XMLParser } from "fast-xml-parser";

type NamespaceObject = { [key: string]: any };

export function generateLockXML(ownerHREF: string): string {
    return getParser().parse(
        namespace(
            {
                lockinfo: {
                    "@_xmlns:d": "DAV:",
                    lockscope: {
                        exclusive: {}
                    },
                    locktype: {
                        write: {}
                    },
                    owner: {
                        href: ownerHREF
                    }
                }
            },
            "d"
        )
    );
}

function getParser(): XMLParser {
    return new XMLParser({
        attributeNamePrefix: "@_",
        format: true,
        ignoreAttributes: false,
        supressEmptyNode: true
    });
}

function namespace<T extends NamespaceObject>(obj: T, ns: string): T {
    const copy = { ...obj };
    for (const key in copy) {
        if (!copy.hasOwnProperty(key)) {
            continue;
        }
        if (copy[key] && typeof copy[key] === "object" && key.indexOf(":") === -1) {
            (copy as NamespaceObject)[`${ns}:${key}`] = namespace(copy[key], ns);
            delete copy[key];
        } else if (/^@_/.test(key) === false) {
            (copy as NamespaceObject)[`${ns}:${key}`] = copy[key];
            delete copy[key];
        }
    }
    return copy;
}

export function parseGenericResponse(xml: string): Object {
    return xmlParser.parse(xml, {
        arrayMode: false,
        ignoreNameSpace: true,
        parseAttributeValue: true,
        parseNodeValue: true
    });
}
