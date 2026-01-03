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
	const storeRegistry: StoreRegistry = {};
	const services: ServiceRegistry = {
		validators: [],
		loaders: [],
		contextBuilders: [],
		senders: [],
		uiComponents: [],
	};

	return {
		stores: {
			set: (type, store) => {
				storeRegistry[type] = store;
			},
			get: (type) => {
				return storeRegistry[type];
			},
		},

		validators: {
			add: (validator) => {
				services.validators.push(validator);
			},
			getAll: () => {
				return services.validators;
			},
		},

		loaders: {
			add: (loader) => {
				services.loaders.push(loader);
			},
			getAll: () => {
				return services.loaders;
			},
		},

		contextBuilders: {
			add: (builder) => {
				services.contextBuilders.push(builder);
			},
			getAll: () => {
				return services.contextBuilders;
			},
		},

		senders: {
			add: (sender) => {
				services.senders.push(sender);
			},
			getAll: () => {
				return services.senders;
			},
		},

		uiComponents: {
			add: (component) => {
				services.uiComponents.push(component);
			},
			getAll: () => {
				return services.uiComponents;
			},
		},
	};
};
