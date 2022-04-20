import { dirname } from "path-posix";

const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

export function encodePath(path) {
    const replaced = path.replace(/\//g, SEP_PATH_POSIX).replace(/\\\\/g, SEP_PATH_WINDOWS);
    const formatted = encodeURIComponent(replaced);
    return formatted.split(SEP_PATH_WINDOWS).join("\\\\").split(SEP_PATH_POSIX).join("/");
}

export function getAllDirectories(path: string): Array<string> {
    if (!path || path === "/") return [];
    let currentPath = path;
    const output: Array<string> = [];
    do {
        output.push(currentPath);
        currentPath = dirname(currentPath);
    } while (currentPath && currentPath !== "/");
    return output;
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
