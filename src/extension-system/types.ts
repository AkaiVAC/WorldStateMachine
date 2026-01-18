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

export type ExtensionKind =
    | "store"
    | "loader"
    | "validator"
    | "contextBuilder"
    | "sender"
    | "ui";

export type Stage = keyof ExtensionsConfig;

export type ExtensionContext = {
    factStore?: unknown;
    eventStore?: unknown;
    entityStore?: unknown;
    relationshipStore?: unknown;
    loaders: unknown[];
    validators: unknown[];
    contextBuilders: unknown[];
    senders: unknown[];
    uiComponents: unknown[];
};

export type ExtensionContribution = {
    loaders?: unknown[];
    validators?: unknown[];
    contextBuilders?: unknown[];
    senders?: unknown[];
    uiComponents?: unknown[];
};

export type Extension = {
    name: string;
    version: string;
    kind: ExtensionKind;
    after?: string[];
    activate: (
        context: ExtensionContext,
        options?: unknown,
    ) => Promise<ExtensionContribution | void> | ExtensionContribution | void;
    deactivate?: () => Promise<void> | void;
};

export type EntryWithStage<T> = {
    stage: keyof ExtensionsConfig;
    index: number;
    entry: T;
};
