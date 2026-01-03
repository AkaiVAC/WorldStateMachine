export type ContextPiece = {
    id: string;
    content: string;
    relevance: number;
    reason: string;
};

export type ContextBuilder = {
    name: string;
    build: (prompt: string, worldId: string) => Promise<ContextPiece[]>;
};
