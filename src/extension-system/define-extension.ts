import type { Hook } from "./hooks";

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
};

export const defineExtension = (ext: Extension): Extension => ext;
