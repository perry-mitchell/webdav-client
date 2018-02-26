const mergeTools = require("../../source/merge.js");
const merge = mergeTools.merge;

describe("merge", function() {
    describe("merge", function() {
        it("clones objects", function() {
            const sourceA = {};
            const sourceB = {};
            const out1 = merge(sourceA);
            expect(out1).to.be.an("object");
            expect(out1).to.not.equal(sourceA);
            const out2 = merge(sourceA, sourceB);
            expect(out2).to.not.equal(sourceA);
            expect(out2).to.not.equal(sourceB);
        });

        it("merges shallow objects", function() {
            const merged = merge({ a: 12, b: 13 }, { b: 14, c: 15 });
            expect(merged).to.have.property("a", 12);
            expect(merged).to.have.property("b", 14);
            expect(merged).to.have.property("c", 15);
        });

        it("merges deep objects", function() {
            const merged = merge(
                {
                    a: {
                        b: {
                            c: {
                                d: 123
                            }
                        }
                    }
                },
                {
                    a: {
                        b: {
                            e: 456
                        }
                    }
                }
            );
            expect(merged).to.deep.equal({
                a: {
                    b: {
                        c: {
                            d: 123
                        },
                        e: 456
                    }
                }
            });
        });

        it("merges multiple objects", function() {
            const merged = merge({ a: true }, { b: true }, { c: true });
            expect(merged).to.deep.equal({
                a: true,
                b: true,
                c: true
            });
        });

        it("overwrites from right to left", function() {
            expect(merge({ a: 1 }, { a: 0 })).to.deep.equal({ a: 0 });
        });
    });
});
