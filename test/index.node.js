const { expect } = require("chai");
const chai = require("chai");
const sinon = require("sinon");
const chaiAsPromised = require("chai-as-promised");

// Assign testing globals
Object.assign(global, {
    expect,
    sinon
});

chai.use(chaiAsPromised);
