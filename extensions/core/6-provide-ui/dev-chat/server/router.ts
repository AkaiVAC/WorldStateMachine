import type { MatchResult, Routes } from "./types";

export const matchRoute = (
  path: string,
  method: string,
  routes: Routes,
): MatchResult => {
  for (const [pattern, handlers] of Object.entries(routes)) {
    if (!handlers[method]) continue;
    if (!pattern.includes(":")) continue;

    const patternParts = pattern.split("/");
    const pathParts = path.split("/");

    if (patternParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathPart = pathParts[i];

      if (patternPart === undefined || pathPart === undefined) {
        matches = false;
        break;
      }

      if (patternPart.startsWith(":")) {
        params[patternPart.slice(1)] = pathPart;
      } else if (patternPart !== pathPart) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return { handler: handlers[method], params };
    }
  }

  return null;
};
