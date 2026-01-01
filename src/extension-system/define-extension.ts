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

type StoreTypeMap = {
	fact: FactStore;
	event: EventStore;
	entity: EntityStore;
	relationship: RelationshipStore;
};

export type ExtensionContext = {
	registerStore<T extends keyof StoreTypeMap>(
		type: T,
		store: StoreTypeMap[T],
	): void;
	getStore<T extends keyof StoreTypeMap>(type: T): StoreTypeMap[T] | undefined;
	registerValidator(validator: Validator): void;
	registerLoader(loader: WorldDataLoader): void;
	registerContextBuilder(builder: ContextBuilder): void;
	registerSender(sender: Sender): void;
	registerUIComponent(component: UIComponent): void;
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
