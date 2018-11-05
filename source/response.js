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

module.exports = {
    handleResponseCode
};
