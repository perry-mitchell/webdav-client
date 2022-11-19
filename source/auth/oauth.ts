import { AuthHeader, OAuthToken } from "../types.js";

export function generateTokenAuthHeader(token: OAuthToken): AuthHeader {
    return `${token.token_type} ${token.access_token}`;
}
