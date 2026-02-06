import type { Extension, Stage } from "../types";

export type ActivationWaves = {
  order: string[];
  waves: string[][];
};

export const buildActivationOrder = (
  stage: Stage,
  extensions: Extension[],
): ActivationWaves => {
  const names = new Set(extensions.map((extension) => extension.name));
  const order = new Map(
    extensions.map((extension, index) => [extension.name, index]),
  );
  const remaining = new Map(
    extensions.map((extension) => [
      extension.name,
      new Set(extension.after ?? []),
    ]),
  );

  for (const [name, dependencies] of remaining) {
    for (const dependency of dependencies) {
      if (!names.has(dependency)) {
        throw new Error(
          `Bootstrap error: unknown dependency ${dependency} for ${name}.`,
        );
      }
    }
  }

  const resolved = new Set<string>();
  const ordered: string[] = [];
  const waves: string[][] = [];

  while (resolved.size < remaining.size) {
    const ready = [...remaining.entries()]
      .filter(([name, deps]) => !resolved.has(name) && deps.size === 0)
      .map(([name]) => name)
      .sort((left, right) => (order.get(left) ?? 0) - (order.get(right) ?? 0));

    if (ready.length === 0) {
      throw new Error(
        `Bootstrap error: dependency cycle detected in ${stage}.`,
      );
    }

    waves.push(ready);

    for (const name of ready) {
      resolved.add(name);
      ordered.push(name);
      for (const deps of remaining.values()) {
        deps.delete(name);
      }
    }
  }

  return { order: ordered, waves };
};
