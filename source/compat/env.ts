declare var TARGET: "web" | "react-native" | undefined;

export function isReactNative(): boolean {
    return typeof TARGET === "string" && TARGET === "react-native";
}

export function isWeb(): boolean {
    return typeof TARGET === "string" && TARGET === "web";
}
