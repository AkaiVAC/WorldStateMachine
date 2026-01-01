import type { ExtensionContext } from "./define-extension";
import type {
	ContextBuilder,
	Sender,
	UIComponent,
	Validator,
	WorldDataLoader,
} from "./interfaces";

type StoreRegistry = {
	fact?: unknown;
	event?: unknown;
	entity?: unknown;
	relationship?: unknown;
};

type ServiceRegistry = {
	validators: Validator[];
	loaders: WorldDataLoader[];
	contextBuilders: ContextBuilder[];
	senders: Sender[];
	uiComponents: UIComponent[];
};

export const createExtensionContext = (): ExtensionContext => {
	const stores: StoreRegistry = {};
	const services: ServiceRegistry = {
		validators: [],
		loaders: [],
		contextBuilders: [],
		senders: [],
		uiComponents: [],
	};

	return {
		registerStore: (type, store) => {
			stores[type] = store;
		},

		getStore: (type) => {
			return stores[type];
		},

		registerValidator: (validator) => {
			services.validators.push(validator);
		},

		registerLoader: (loader) => {
			services.loaders.push(loader);
		},

		registerContextBuilder: (builder) => {
			services.contextBuilders.push(builder);
		},

		registerSender: (sender) => {
			services.senders.push(sender);
		},

		registerUIComponent: (component) => {
			services.uiComponents.push(component);
		},
	};
};
