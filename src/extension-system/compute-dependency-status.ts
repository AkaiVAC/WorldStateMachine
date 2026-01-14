import type { ExtensionsConfig, Status } from "./types";

type ExtensionInfo = {
	name: string;
	after?: string[];
};

export const computeDependencyStatus = (
	config: ExtensionsConfig,
	extensions: Map<string, ExtensionInfo>,
): ExtensionsConfig => {
	const statusMap = new Map<string, Status>();

	const allEntries = [
		...config.stores,
		...config.loaders,
		...config.validators,
		...config.contextBuilders,
		...config.senders,
		...config.ui,
	];

	for (const entry of allEntries) {
		statusMap.set(entry.name, entry.status);
	}

	for (const entry of allEntries) {
		if (entry.status === "on") {
			const ext = extensions.get(entry.name);
			if (ext?.after) {
				for (const dep of ext.after) {
					const depStatus = statusMap.get(dep);
					if (depStatus === "off" || depStatus?.startsWith("needs:")) {
						statusMap.set(entry.name, `needs:${dep}`);
						break;
					}
				}
			}
		}
	}

	const updateStatus = (entries: typeof config.loaders) =>
		entries.map(entry => ({
			...entry,
			status: statusMap.get(entry.name) || entry.status,
		}));

	return {
		stores: updateStatus(config.stores),
		loaders: updateStatus(config.loaders),
		validators: updateStatus(config.validators),
		contextBuilders: updateStatus(config.contextBuilders),
		senders: updateStatus(config.senders),
		ui: updateStatus(config.ui),
	};
};
