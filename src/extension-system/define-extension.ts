import type { Hook } from "./hooks";
import type {
    ContextBuilder,
    EntityStore,
    EventStore,
    FactStore,
    RelationshipStore,
    Sender,
    UIComponent,
    Validator,
    WorldDataLoader,
} from "./interfaces";

export type StoreTypeMap = {
    fact: FactStore;
    event: EventStore;
    entity: EntityStore;
    relationship: RelationshipStore;
};

export type StoreCollection = {
    set: <T extends keyof StoreTypeMap>(
        type: T,
        store: StoreTypeMap[T],
    ) => void;
    get: <T extends keyof StoreTypeMap>(type: T) => StoreTypeMap[T] | undefined;
};

type ValidatorCollection = {
    add: (validator: Validator) => void;
    getAll: () => Validator[];
};

type LoaderCollection = {
    add: (loader: WorldDataLoader) => void;
    getAll: () => WorldDataLoader[];
};

type ContextBuilderCollection = {
    add: (builder: ContextBuilder) => void;
    getAll: () => ContextBuilder[];
};

type SenderCollection = {
    add: (sender: Sender) => void;
    getAll: () => Sender[];
};

type UIComponentCollection = {
    add: (component: UIComponent) => void;
    getAll: () => UIComponent[];
};

export type ExtensionContext = {
    stores: StoreCollection;
    validators: ValidatorCollection;
    loaders: LoaderCollection;
    contextBuilders: ContextBuilderCollection;
    senders: SenderCollection;
    uiComponents: UIComponentCollection;
};

export type ExtensionProvides = {
    validators?: string[];
    loaders?: string[];
    contextBuilders?: string[];
    senders?: string[];
    uiComponents?: string[];
};

export type ExtensionReplacement = {
    reason: string;
    interface: string;
    compatible: boolean;
};

export type Extension = {
    id?: string;
    name: string;
    version: string;
    description?: string;
    author?: string;
    dependencies?: string[];
    provides?: ExtensionProvides;
    replaces?: Record<string, ExtensionReplacement>;
    hooks?: Partial<Record<Hook, string[]>>;
    config?: Record<string, unknown>;
    activate: (context: ExtensionContext) => Promise<void> | void;
};

export const defineExtension = (ext: Extension): Extension => ext;
