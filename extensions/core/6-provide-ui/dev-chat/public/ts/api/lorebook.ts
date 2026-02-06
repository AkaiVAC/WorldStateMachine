import type { LorebookEntry } from "../state.ts";

export type LorebookResponse = {
  entries: LorebookEntry[];
  groups: string[];
};

export const fetchLorebook = async (): Promise<LorebookResponse> => {
  const res = await fetch("/api/lorebook");
  return res.json();
};
