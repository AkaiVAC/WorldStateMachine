import { existsSync } from "node:fs";
import { join } from "node:path";
import { CONFIG_FILE_NAME } from "./config-constants";

export const getConfigPath = (path: string) => {
    const configPath = join(path, CONFIG_FILE_NAME);
    if (!existsSync(configPath)) {
        throw new Error(
            `Config missing: ${CONFIG_FILE_NAME}. Restore the default file.`,
        );
    }
    return configPath;
};
