const SEP_PATH_POSIX = "__PATH_SEPARATOR_POSIX__";
const SEP_PATH_WINDOWS = "__PATH_SEPARATOR_WINDOWS__";

export function encodePath(path) {
    const replaced = path.replace(/\//g, SEP_PATH_POSIX).replace(/\\\\/g, SEP_PATH_WINDOWS);
    const formatted = encodeURIComponent(replaced);
    return formatted
        .split(SEP_PATH_WINDOWS)
        .join("\\\\")
        .split(SEP_PATH_POSIX)
        .join("/");
}
