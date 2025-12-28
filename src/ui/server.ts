import { join } from "node:path";

export type ServerConfig = {
	port: number;
	publicDir: string;
};

export type RouteHandler = (req: Request) => Response | Promise<Response>;

export type Routes = {
	[path: string]: {
		[method: string]: RouteHandler;
	};
};

const defaultConfig: ServerConfig = {
	port: 3000,
	publicDir: join(import.meta.dir, "public"),
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
				return routes[path][method](req);
			}

			if (method === "GET" && !path.startsWith("/api/")) {
				return serveStatic(path, publicDir);
			}

			return new Response("Not Found", { status: 404 });
		},
	});

	return server;
};

const serveStatic = async (
	path: string,
	publicDir: string,
): Promise<Response> => {
	const filePath = path === "/" ? "/index.html" : path;
	const fullPath = join(publicDir, filePath);

	const file = Bun.file(fullPath);
	const exists = await file.exists();

	if (!exists) {
		return new Response("Not Found", { status: 404 });
	}

	const contentType = getContentType(filePath);
	return new Response(file, {
		headers: { "Content-Type": contentType },
	});
};

const getContentType = (path: string): string => {
	if (path.endsWith(".html")) return "text/html";
	if (path.endsWith(".js")) return "application/javascript";
	if (path.endsWith(".css")) return "text/css";
	if (path.endsWith(".json")) return "application/json";
	return "application/octet-stream";
};
