import { expect } from "chai";
import { readFile } from "fs/promises";
import { parseXML } from "../../../source/index.js";

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
});
