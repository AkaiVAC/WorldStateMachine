import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export type DiscoveredExtension = {
    path: string;
};

const hasConfig = (path: string): boolean =>
    existsSync(join(path, "extension.config.ts"));

const isDirectory = (path: string): boolean => statSync(path).isDirectory();

export const discoverExtensions = (directory: string): DiscoveredExtension[] =>
    readdirSync(directory)
        .map((entry) => join(directory, entry))
        .filter(isDirectory)
        .filter(hasConfig)
        .map((path) => ({ path }));
