import type { Extension } from "./define-extension";

export type ExtensionRegistry = {
    register: (extension: Extension) => void;
    get: (name: string) => Extension | undefined;
    getAll: () => Extension[];
    has: (name: string) => boolean;
    validate: () => ValidationError[];
};

export type ValidationError = {
    type: "missing-dependency" | "name-collision" | "circular-dependency";
    extension: string;
    message: string;
};

export const createExtensionRegistry = (): ExtensionRegistry => {
    const extensions = new Map<string, Extension>();

    const register = (extension: Extension) => {
        if (extensions.has(extension.name)) {
            throw new Error(`Extension '${extension.name}' already registered`);
        }
        extensions.set(extension.name, extension);
    };

    const get = (name: string): Extension | undefined => {
        return extensions.get(name);
    };

    const getAll = (): Extension[] => {
        return Array.from(extensions.values());
    };

    const has = (name: string): boolean => {
        return extensions.has(name);
    };

    const validate = (): ValidationError[] => {
        const errors: ValidationError[] = [];

        for (const ext of extensions.values()) {
            if (ext.dependencies) {
                for (const dep of ext.dependencies) {
                    if (!extensions.has(dep)) {
                        errors.push({
                            type: "missing-dependency",
                            extension: ext.name,
                            message: `Missing dependency '${dep}'`,
                        });
                    }
                }
            }
        }

        const detected = detectCircularDependencies(extensions);
        errors.push(...detected);

        return errors;
    };

    return { register, get, getAll, has, validate };
};

const detectCircularDependencies = (
    extensions: Map<string, Extension>,
): ValidationError[] => {
    const errors: ValidationError[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (name: string, path: string[]): void => {
        if (visited.has(name)) return;
        if (visiting.has(name)) {
            const cycle = [...path, name].join(" -> ");
            errors.push({
                type: "circular-dependency",
                extension: name,
                message: `Circular dependency detected: ${cycle}`,
            });
            return;
        }

        visiting.add(name);
        const ext = extensions.get(name);
        if (ext?.dependencies) {
            for (const dep of ext.dependencies) {
                visit(dep, [...path, name]);
            }
        }
        visiting.delete(name);
        visited.add(name);
    };

    for (const name of extensions.keys()) {
        visit(name, []);
    }

    return errors;
};
