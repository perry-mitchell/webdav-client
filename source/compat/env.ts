declare var WEB: boolean;

export function isWeb(): boolean {
    if (typeof WEB === "boolean" && WEB === true) {
        return true;
    }
    return false;
}
