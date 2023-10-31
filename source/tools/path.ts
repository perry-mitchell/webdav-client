import { Layerr } from "layerr";
import { default as path } from "path-posix";

const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

export function encodePath(filePath: string): string {
    try {
        const replaced = filePath.replace(/\//g, SEP_PATH_POSIX).replace(/\\\\/g, SEP_PATH_WINDOWS);
        const formatted = encodeURIComponent(replaced);
        return formatted.split(SEP_PATH_WINDOWS).join("\\\\").split(SEP_PATH_POSIX).join("/");
    } catch (err) {
        throw new Layerr(err, "Failed encoding path");
    }
}

export function getAllDirectories(directory: string): Array<string> {
    if (!directory || directory === "/") return [];
    let currentPath = directory;
    const output: Array<string> = [];
    do {
        output.push(currentPath);
        currentPath = path.dirname(currentPath);
    } while (currentPath && currentPath !== "/");
    return output;
}

export function makePathAbsolute(pathStr: string): string {
    return pathStr.startsWith("/") ? pathStr : "/" + pathStr;
}

export function normalisePath(pathStr: string): string {
    let normalisedPath = pathStr;
    if (normalisedPath[0] !== "/") {
        normalisedPath = "/" + normalisedPath;
    }
    if (/^.+\/$/.test(normalisedPath)) {
        normalisedPath = normalisedPath.substr(0, normalisedPath.length - 1);
    }
    return normalisedPath;
}
