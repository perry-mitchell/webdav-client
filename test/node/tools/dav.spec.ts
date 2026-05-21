import { describe, expect, it } from "vitest";
import { readFile } from "fs/promises";
import { parseXML, type WebDAVEntityDecoderOptions } from "../../../source/index.js";

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
            const parsed = await parseXML(xml, {
                attributeNamePrefix: "@",
                attributeParsers: [],
                clarkNotationProps: true,
                tagParsers: []
            });
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
            const parsed = await parseXML(xmlMalformed, {
                attributeNamePrefix: "@",
                attributeParsers: [],
                clarkNotationProps: true,
                tagParsers: []
            });
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
