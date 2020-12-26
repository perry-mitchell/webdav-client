import _joinURL from "url-join";

export function joinURL(...parts: Array<string>) {
    return _joinURL(
        parts.reduce((output, nextPart, partIndex) => {
            if (partIndex === 0 || nextPart !== "/" || (nextPart === "/" && output[output.length - 1] !== "/")) {
                output.push(nextPart);
            }
            return output;
        }, [])
    );
}
