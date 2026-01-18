import { defineExtension } from "@ext-system/define-extension";
import { chatHandler } from "./routes/chat";
import { lorebookHandler } from "./routes/lorebook";
import { modelsHandler } from "./routes/models";
import {
	createSessionHandler,
	deleteSessionHandler,
	getSessionHandler,
	listSessionsHandler,
	updateSessionHandler,
} from "./routes/sessions";
import { createServer, type Routes } from "./server/index";

const routes: Routes = {
	"/api/lorebook": {
		GET: lorebookHandler,
	},
	"/api/chat": {
		POST: chatHandler,
	},
	"/api/models": {
		GET: modelsHandler,
	},
	"/api/sessions": {
		GET: listSessionsHandler,
		POST: createSessionHandler,
	},
	"/api/sessions/:id": {
		GET: getSessionHandler,
		PUT: updateSessionHandler,
		DELETE: deleteSessionHandler,
	},
};

export const createDevChatServer = () => createServer(routes);

export default defineExtension({
	name: "@core/dev-chat",
	version: "1.0.0",
	kind: "ui",
	activate: () => {
		const server = createDevChatServer();
		console.log(`Lorebook Chat running at http://localhost:${server.port}`);
		return { uiComponents: [server] };
	},
});

