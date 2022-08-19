declare module "hot-patcher" {
    class HotPatcher {
        patchInline(key: string, method: any, ...args: any[]): any;
    }
    export default HotPatcher;
}
