import { HotPatcher } from "hot-patcher";

let __patcher: HotPatcher = null;

export function getPatcher(): HotPatcher {
    if (!__patcher) {
        __patcher = new HotPatcher();
    }
    return __patcher;
}
