import { join } from "node:path";
import { matchRoute } from "./router";
import { serveStatic } from "./static";
import type { Routes, ServerConfig } from "./types";

export type { RouteHandler, Routes, ServerConfig } from "./types";

const defaultConfig: ServerConfig = {
	port: 3000,
	publicDir: join(import.meta.dir, "../public"),
};

export const createServer = (
	routes: Routes,
	config: Partial<ServerConfig> = {},
) => {
	const { port, publicDir } = { ...defaultConfig, ...config };

	const server = Bun.serve({
		port,
		fetch: async (req) => {
			const url = new URL(req.url);
			const path = url.pathname;
			const method = req.method;

			if (routes[path]?.[method]) {
				return routes[path][method](req, {});
			}

			const match = matchRoute(path, method, routes);
			if (match) {
				return match.handler(req, match.params);
			}

			if (method === "GET" && !path.startsWith("/api/")) {
				return serveStatic(path, publicDir);
			}

			return new Response("Not Found", { status: 404 });
		},
	});

	return server;
};
