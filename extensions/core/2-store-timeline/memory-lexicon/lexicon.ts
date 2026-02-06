export type Lexicon = {
  addTerm: (worldId: string, term: string) => void;
  hasTerm: (worldId: string, term: string) => boolean;
};

export const createLexicon = (): Lexicon => {
  const terms = new Map<string, Set<string>>();

  return {
    addTerm: (worldId, term) => {
      if (!terms.has(worldId)) {
        terms.set(worldId, new Set());
      }
      terms.get(worldId)?.add(term.toLowerCase());
    },
    hasTerm: (worldId, term) => {
      return terms.get(worldId)?.has(term.toLowerCase()) ?? false;
    },
  };
};
