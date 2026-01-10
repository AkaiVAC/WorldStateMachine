export type Status = "on" | "off" | `needs:${string}`;

export type ExtensionEntry = {
    name: string;
    path: string;
    status: Status;
    options?: unknown;
};

export type ExtensionsConfig = {
    loaders: ExtensionEntry[];
    stores: ExtensionEntry[];
    validators: ExtensionEntry[];
    contextBuilders: ExtensionEntry[];
    senders: ExtensionEntry[];
    ui: ExtensionEntry[];
};

export type EntryWithStage<T> = {
    stage: keyof ExtensionsConfig;
    index: number;
    entry: T;
};
