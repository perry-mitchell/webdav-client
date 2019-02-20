const minimatch = require("minimatch");

function handleResponseCode(response) {
    const status = parseInt(response.status, 10);
    let err;
    if (status >= 400) {
        err = new Error("Invalid response: " + status + " " + response.statusText);
        err.status = status;
        throw err;
    }
    return response;
}

function processResponsePayload(response, data, isDetailed = false) {
    return isDetailed
        ? {
              data,
              headers: response.headers || {}
          }
        : data;
}

function processGlobFilter(files, glob) {
    return files.filter(file => minimatch(file.filename, glob.pattern, { matchBase: true }));
}

module.exports = {
    handleResponseCode,
    processResponsePayload,
    processGlobFilter
};
