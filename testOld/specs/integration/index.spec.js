var createClient = require("../../../source/index.js");

describe("setFetchMethod", function() {

    beforeEach(function() {
        this.fetchStub = sinon.stub();
        this.fetchStub.returns(Promise.resolve({
            status: 200
        }));
        createClient.setFetchMethod(this.fetchStub);
        this.client = createClient("https://test.com");
    });

    afterEach(function() {
        createClient.setFetchMethod(null);
    });

    it("overrides the built in fetch method", function() {
        var client = this.client,
            fetchStub = this.fetchStub;
        expect(fetchStub.callCount).to.equal(0);
        return client.deleteFile("/testfile.txt")
            .then(function() {
                expect(fetchStub.callCount).to.equal(1);
                var url = fetchStub.firstCall.args[0];
                expect(url).to.equal("https://test.com/testfile.txt");
            });
    });

});
