const { getStat } = require("./stat.js");

function pathExists(remotePath, options) {
    return getStat(remotePath, options)
        .then(() => true)
        .catch(err => {
            if (err.response && err.response.status === 404) {
                return false;
            }
            throw err;
        });
}

module.exports = {
    pathExists
};
