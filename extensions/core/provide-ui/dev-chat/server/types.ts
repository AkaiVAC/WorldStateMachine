export type ServerConfig = {
	port: number;
	publicDir: string;
};

export type RouteHandler = (
	req: Request,
	params?: Record<string, string>,
) => Response | Promise<Response>;

export type Routes = {
	[path: string]: {
		[method: string]: RouteHandler;
	};
};

export type MatchResult = {
	handler: RouteHandler;
	params: Record<string, string>;
} | null;
