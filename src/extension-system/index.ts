export type { DiscoveredExtension } from "./1-discover/discover-extensions";
export { discoverExtensions } from "./1-discover/discover-extensions";

export type Extension = {
    name: string;
    version: string;
    description?: string;
    author?: string;
    dependencies?: string[];
    provides?: {
        loaders?: string[];
        validators?: string[];
        contextBuilders?: string[];
        senders?: string[];
        uiComponents?: string[];
    };
    activate: () => void | Promise<void>;
};

export const defineExtension = (ext: Extension): Extension => ext;
