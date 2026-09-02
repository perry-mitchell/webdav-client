import { describe, expect, it } from "vitest";
import { readFile } from "fs/promises";
import {
    parseXML,
    type WebDAVEntityDecoderOptions,
    type WebDAVParsingContext
} from "../../../source/index.js";
import { displaynameTagParser } from "../../../source/tools/dav.js";

describe("parseXML", function () {
    it("keeps numeric-looking displaynames", async function () {
        const data = await readFile(
            new URL("../../responses/propfind-float-like-displayname.xml", import.meta.url)
        );
        const parsed = await parseXML(data.toString());
        expect(parsed.multistatus.response).to.have.length(1);
        // Ensure trailing zero is not lost
        expect(parsed.multistatus.response[0].propstat.prop.displayname).to.equal("2024.10");
    });

    it("correctly parses property attributes", async function () {
        const data = await readFile(
            new URL("../../responses/propfind-attributes.xml", import.meta.url)
        );

        const parsed = await parseXML(data.toString());

        expect(parsed.multistatus.response).to.have.length(1);
        expect(
            parsed.multistatus.response[0].propstat.prop["system-tags"]["system-tag"]
        ).to.deep.equal([
            {
                "@can-assign": "true",
                "@id": "321",
                "@checked": true,
                text: "Tag1"
            },
            {
                "@can-assign": "false",
                "@id": "654",
                "@prop": "",
                text: "Tag2"
            }
        ]);
    });

    it("parses property attributes with different prefix", async function () {
        const data = await readFile(
            new URL("../../responses/propfind-attributes.xml", import.meta.url)
        );

        const parsed = await parseXML(data.toString(), {
            attributeNamePrefix: "",
            attributeParsers: [],
            tagParsers: []
        });

        expect(parsed.multistatus.response).to.have.length(1);
        expect(
            parsed.multistatus.response[0].propstat.prop["system-tags"]["system-tag"]
        ).to.deep.equal([
            {
                "can-assign": "true",
                id: "321",
                checked: true,
                text: "Tag1"
            },
            {
                "can-assign": "false",
                id: "654",
                prop: "",
                text: "Tag2"
            }
        ]);
    });

    it("parses property attributes with custom parser", async function () {
        // Dummy parser that parses all string "true" or "false" to the boolean value
        const booleanAttributeParser = (path: string, value: string) => {
            if (["true", "false"].includes(value)) {
                return value === "true";
            }
            return value;
        };

        const data = await readFile(
            new URL("../../responses/propfind-attributes.xml", import.meta.url)
        );

        const parsed = await parseXML(data.toString(), {
            attributeNamePrefix: "",
            attributeParsers: [booleanAttributeParser],
            tagParsers: []
        });

        expect(parsed.multistatus.response).to.have.length(1);
        expect(
            parsed.multistatus.response[0].propstat.prop["system-tags"]["system-tag"]
        ).to.deep.equal([
            {
                "can-assign": true,
                id: "321",
                checked: true,
                text: "Tag1"
            },
            {
                "can-assign": false,
                id: "654",
                prop: "",
                text: "Tag2"
            }
        ]);
    });

    it("correctly parses property attributes that have the same name as nested prop", async function () {
        const data = await readFile(
            new URL("../../responses/propfind-attributes-conflict.xml", import.meta.url)
        );

        const parsed = await parseXML(data.toString());

        expect(parsed.multistatus.response).to.have.length(1);
        expect(parsed.multistatus.response[0].propstat.prop.prop).to.deep.equal({
            "@link": "value",
            link: "text value"
        });
    });

    it("parses props with custom parser", async function () {
        // Dummy parser that parses all string "true" or "false" to the boolean value
        const shareAttributesParser = (path: string, value: string) => {
            if (path.endsWith("prop.share-attributes")) {
                return JSON.parse(value);
            }
            return value;
        };

        const data = await readFile(
            new URL("../../responses/propfind-nextcloud-share-attributes.xml", import.meta.url)
        );

        const parsed = await parseXML(data.toString(), {
            attributeNamePrefix: "",
            attributeParsers: [],
            tagParsers: [shareAttributesParser]
        });

        expect(parsed.multistatus.response).to.have.length(1);
        expect(parsed.multistatus.response[0].propstat.prop["share-attributes"]).to.deep.equal([
            {
                scope: "permissions",
                key: "download",
                value: false
            }
        ]);
    });

    describe("clarkNotationProps", function () {
        const clarkContext = (): WebDAVParsingContext => ({
            attributeNamePrefix: "@",
            attributeParsers: [],
            clarkNotationProps: true,
            tagParsers: []
        });

        // Two extensions reuse the local name `value` under different
        // namespaces. We use the inline default-namespace serialisation
        // (`xmlns="..."` on each element rather than a prefix) because that
        // is what Go's `encoding/xml` produces for namespaces it has no
        // registered prefix for — and what the OpenCloud server actually
        // sends for custom-namespace properties.
        const xml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>file.txt</d:displayname>
                <oc:permissions>RDNVW</oc:permissions>
                <value xmlns="http://opencloud.eu/ns/extensions/com.example.project">PROJ-123</value>
                <priority xmlns="http://opencloud.eu/ns/extensions/com.example.project">high</priority>
                <value xmlns="http://opencloud.eu/ns/extensions/com.example.review">approved</value>
                <reviewer xmlns="http://opencloud.eu/ns/extensions/com.example.review">alice</reviewer>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;

        it("merges same-local-name props from different namespaces into one key by default", async function () {
            const parsed = await parseXML(xml);
            const props = parsed.multistatus.response[0].propstat.prop;
            // The two `value` elements collapse to one `value` key; values
            // are preserved as an array but their namespace origin is lost.
            expect(props.value).to.deep.equal(["PROJ-123", "approved"]);
            expect(props.displayname).to.equal("file.txt");
        });

        it("rewrites prop keys to Clark notation when clarkNotationProps is true", async function () {
            const parsed = await parseXML(xml, clarkContext());
            // Structural envelope unchanged: bare keys, normalised array of responses.
            expect(parsed.multistatus.response).to.have.length(1);
            const propstat = parsed.multistatus.response[0].propstat;
            expect(propstat.status).to.equal("HTTP/1.1 200 OK");

            // Prop keys are in Clark notation. Standard DAV/oc props resolve
            // their prefix against the xmlns scope from the multistatus root;
            // inline-default-namespace props resolve from their own xmlns
            // attribute. The two same-local-name `value` props now coexist
            // as distinct Clark keys.
            const props = propstat.prop as unknown as Record<string, string>;
            expect(props["{DAV:}displayname"]).to.equal("file.txt");
            expect(props["{http://owncloud.org/ns}permissions"]).to.equal("RDNVW");
            expect(props["{http://opencloud.eu/ns/extensions/com.example.project}value"]).to.equal(
                "PROJ-123"
            );
            expect(
                props["{http://opencloud.eu/ns/extensions/com.example.project}priority"]
            ).to.equal("high");
            expect(props["{http://opencloud.eu/ns/extensions/com.example.review}value"]).to.equal(
                "approved"
            );
            expect(
                props["{http://opencloud.eu/ns/extensions/com.example.review}reviewer"]
            ).to.equal("alice");
        });

        it("resolves prefixed prop tags against the multistatus xmlns scope", async function () {
            // The other clarkNotationProps test uses inline `xmlns="..."` on
            // each prop element (Sabre's serialisation for custom namespaces);
            // this test exercises the other path where the namespace is
            // resolved from the prefix-to-URI map declared on the multistatus
            // element. Nextcloud and similar servers serialise this way.
            const prefixedXml = `<?xml version="1.0"?>
<d:multistatus
    xmlns:d="DAV:"
    xmlns:oc="http://owncloud.org/ns"
    xmlns:nc="http://nextcloud.org/ns">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>file.txt</d:displayname>
                <oc:permissions>RDNVW</oc:permissions>
                <nc:has-preview>true</nc:has-preview>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parsed = await parseXML(prefixedXml, clarkContext());
            const props = parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                string
            >;
            expect(props["{DAV:}displayname"]).to.equal("file.txt");
            expect(props["{http://owncloud.org/ns}permissions"]).to.equal("RDNVW");
            expect(props["{http://nextcloud.org/ns}has-preview"]).to.equal(true);
        });

        it("collects repeated props of the same namespace under one Clark key", async function () {
            const repeatedXml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <value xmlns="http://opencloud.eu/ns/extensions/com.example.project">PROJ-123</value>
                <value xmlns="http://opencloud.eu/ns/extensions/com.example.project">PROJ-456</value>
                <value xmlns="http://opencloud.eu/ns/extensions/com.example.project">PROJ-789</value>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parsed = await parseXML(repeatedXml, clarkContext());
            const props = parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                string[]
            >;
            // Unlike the cross-namespace case these genuinely share one Clark
            // key, so their values are collected into an array in document
            // order rather than overwriting each other.
            expect(
                props["{http://opencloud.eu/ns/extensions/com.example.project}value"]
            ).to.deep.equal(["PROJ-123", "PROJ-456", "PROJ-789"]);
        });

        it("merges different serialisations of one namespace into a single Clark key", async function () {
            // The same namespace arrives three ways inside one <prop>: bound
            // to two different prefixes and as an inline default xmlns. The
            // parser keeps those as three distinct keys, so it is the walker
            // that has to collect them rather than let the later ones
            // overwrite the earlier ones.
            const mixedXml = `<?xml version="1.0"?>
<d:multistatus
    xmlns:d="DAV:"
    xmlns:p="http://opencloud.eu/ns/extensions/com.example.project"
    xmlns:proj="http://opencloud.eu/ns/extensions/com.example.project">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <p:value>PROJ-123</p:value>
                <proj:value>PROJ-456</proj:value>
                <value xmlns="http://opencloud.eu/ns/extensions/com.example.project">PROJ-789</value>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parsed = await parseXML(mixedXml, clarkContext());
            const props = parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                string[]
            >;
            expect(
                props["{http://opencloud.eu/ns/extensions/com.example.project}value"]
            ).to.deep.equal(["PROJ-123", "PROJ-456", "PROJ-789"]);
            expect(Object.keys(props)).to.have.length(1);
        });

        it("resolves namespaces declared on the prop element itself", async function () {
            const inlineXml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <x:custom xmlns:x="http://example.com/ns">value</x:custom>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parsed = await parseXML(inlineXml, clarkContext());
            const props = parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                string
            >;
            // The prefix is bound on the property element rather than on the
            // multistatus, so it has to be folded into the scope before the
            // key is resolved.
            expect(props["{http://example.com/ns}custom"]).to.equal("value");
        });

        it("leaves the envelope shape untouched", async function () {
            const emptyXml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns"/>`;
            const clark = await parseXML(emptyXml, clarkContext());
            // The namespace declarations are consumed by the walker, so an
            // empty multistatus stays empty instead of being mistaken for a
            // response with props.
            expect(clark).to.deep.equal(await parseXML(emptyXml));
            expect(clark.multistatus.response).to.deep.equal([]);

            const parsed = await parseXML(xml, clarkContext());
            expect(Object.keys(parsed.multistatus)).to.deep.equal(["response"]);
            expect(Object.keys(parsed.multistatus.response[0])).to.deep.equal(["href", "propstat"]);
        });

        it("keeps empty and structured prop values in their default shape", async function () {
            const shapesXml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
    <d:response>
        <d:href>/dir</d:href>
        <d:propstat>
            <d:prop>
                <oc:favorite/>
                <marker xmlns="http://example.com/ns"/>
                <d:resourcetype><d:collection/></d:resourcetype>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parsed = await parseXML(shapesXml, clarkContext());
            const props = parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                unknown
            >;
            expect(props["{http://owncloud.org/ns}favorite"]).to.equal("");
            expect(props["{http://example.com/ns}marker"]).to.equal("");
            // Only the direct children of <prop> are rewritten, so nested
            // elements keep the prefix the server serialised them with.
            expect(props["{DAV:}resourcetype"]).to.deep.equal({ "d:collection": "" });
        });

        it("passes unprefixed jPaths to tag and attribute parsers", async function () {
            const dottedPrefixXml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:" xmlns:my.ns="http://example.com/ns">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>2024.10</d:displayname>
                <my.ns:tag my.ns:id="007">secret</my.ns:tag>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parseRecording = async (clarkNotationProps: boolean) => {
                const tags: string[] = [];
                const attributes: string[] = [];
                const parsed = await parseXML(dottedPrefixXml, {
                    attributeNamePrefix: "@",
                    clarkNotationProps,
                    attributeParsers: [
                        (jPath, value) => {
                            attributes.push(jPath);
                            return value;
                        }
                    ],
                    tagParsers: [
                        (jPath, value) => {
                            tags.push(jPath);
                            return value;
                        },
                        displaynameTagParser
                    ]
                });
                return { attributes, parsed, tags };
            };
            const clark = await parseRecording(true);
            const plain = await parseRecording(false);
            // Prefixes are stripped per path segment, so a prefix containing a
            // dot cannot be mistaken for a segment boundary, and the xmlns
            // declarations Clark mode retains never reach the parsers either.
            expect(clark.tags).to.deep.equal(plain.tags);
            expect(clark.attributes).to.deep.equal(plain.attributes);
            expect(clark.tags).to.include("multistatus.response.propstat.prop.displayname");
            expect(clark.attributes).to.include("multistatus.response.propstat.prop.tag");
            const props = clark.parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                string
            >;
            // The built-in displayname parser matched, so the value was not
            // interpreted as the number 2024.1.
            expect(props["{DAV:}displayname"]).to.equal("2024.10");
        });

        it("falls back to the null namespace for prefixes that are not in scope", async function () {
            const xmlMalformed = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <d:displayname>file.txt</d:displayname>
                <x:lonely xmlns:d="DAV:">orphan</x:lonely>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;
            const parsed = await parseXML(xmlMalformed, clarkContext());
            const props = parsed.multistatus.response[0].propstat.prop as unknown as Record<
                string,
                string
            >;
            // Known prefix (d:) resolves normally; unknown prefix (x:) has no
            // URI in scope and falls back to the null namespace, yielding a
            // bare local-name key rather than throwing or losing the data.
            expect(props["{DAV:}displayname"]).to.equal("file.txt");
            expect(props.lonely).to.equal("orphan");
        });
    });

    describe("entityDecoder", function () {
        it("parses XML with entities when entityDecoder is not set", async function () {
            const xml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <displayname>A &amp; B &lt; C</displayname>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;

            const parsed = await parseXML(xml);
            expect(parsed.multistatus.response).to.have.length(1);
            expect(parsed.multistatus.response[0].propstat.prop.displayname).to.equal("A & B < C");
        });

        it("parses XML with entities when entityDecoder limit is set", async function () {
            const decoderOptions: WebDAVEntityDecoderOptions = {
                limit: {
                    maxTotalExpansions: 0,
                    maxExpandedLength: 0
                }
            };

            const xml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <displayname>A &amp; B &lt; C</displayname>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;

            const parsed = await parseXML(xml, {
                attributeNamePrefix: "@",
                attributeParsers: [],
                entityDecoder: decoderOptions,
                tagParsers: []
            });
            expect(parsed.multistatus.response).to.have.length(1);
            expect(parsed.multistatus.response[0].propstat.prop.displayname).to.equal("A & B < C");
        });

        it("applies maxTotalExpansions limit when set", async function () {
            const decoderOptions: WebDAVEntityDecoderOptions = {
                limit: {
                    maxTotalExpansions: 1
                }
            };

            const xml = `<?xml version="1.0"?>
<d:multistatus xmlns:d="DAV:">
    <d:response>
        <d:href>/file.txt</d:href>
        <d:propstat>
            <d:prop>
                <displayname>A &amp; B</displayname>
            </d:prop>
            <d:status>HTTP/1.1 200 OK</d:status>
        </d:propstat>
    </d:response>
</d:multistatus>`;

            const parsed = await parseXML(xml, {
                attributeNamePrefix: "@",
                attributeParsers: [],
                entityDecoder: decoderOptions,
                tagParsers: []
            });
            expect(parsed.multistatus.response).to.have.length(1);
            expect(parsed.multistatus.response[0].propstat.prop.displayname).to.equal("A & B");
        });
    });
});
