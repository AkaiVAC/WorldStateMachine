export type UIRoute = {
    path: string;
    handler: (req: unknown, res: unknown) => Promise<void> | void;
};

export type UIComponent = {
    name: string;
    routes?: UIRoute[];
    staticPath?: string;
};
