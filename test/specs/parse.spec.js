var parse = require("../../source/adapter/parse.js"),
    getOne = parse.getOne;

describe("parse", function() {

    describe("getOne", function() {

        beforeEach(function() {
            this.obj = {
                "abc-def": {
                    items: [
                        null,
                        {
                            t: 18
                        }
                    ]
                },
                shallow: false,
                "lp1:getcontentlength": 10
            };
        });

        it("gets deep values", function() {
            expect(getOne(this.obj, ["abc-def.items.1.t"])).to.equal(18);
        });

        it("falls back to other keys", function() {
            expect(getOne(this.obj, ["shwoo", "safgg", "shallow", "wrong"])).to.equal(false);
        });

    });

});
