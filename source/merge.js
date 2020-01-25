function merge(...args) {
    let output = null,
        items = [...args];
    while (items.length > 0) {
        const nextItem = items.shift();
        if (!output) {
            output = Object.assign({}, nextItem);
        } else {
            output = mergeObjects(output, nextItem);
        }
    }
    return output;
}

function mergeObjects(obj1, obj2) {
    const output = Object.assign({}, obj1);
    Object.keys(obj2).forEach(key => {
        if (!output.hasOwnProperty(key)) {
            output[key] = obj2[key];
            return;
        }
        if (Array.isArray(obj2[key])) {
            output[key] = Array.isArray(output[key]) ? [...output[key], ...obj2[key]] : [...obj2[key]];
        } else if (typeof obj2[key] === "object" && !!obj2[key]) {
            output[key] =
                typeof output[key] === "object" && !!output[key]
                    ? mergeObjects(output[key], obj2[key])
                    : Object.assign({}, obj2[key]);
        } else {
            output[key] = obj2[key];
        }
    });
    return output;
}

module.exports = {
    merge
};
