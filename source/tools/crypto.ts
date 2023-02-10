import md5 from "md5";

export function ha1Compute(
    algorithm: string,
    user: string,
    realm: string,
    pass: string,
    nonce: string,
    cnonce: string,
    ha1: string
): string {
    const ha1Hash = ha1 || (md5(`${user}:${realm}:${pass}`) as string);
    if (algorithm && algorithm.toLowerCase() === "md5-sess") {
        return md5(`${ha1Hash}:${nonce}:${cnonce}`) as string;
    }
    return ha1Hash;
}
