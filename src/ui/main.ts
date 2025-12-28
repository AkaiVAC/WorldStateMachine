import { chatHandler } from "./routes/chat";
import { lorebookHandler } from "./routes/lorebook";
import { createServer, type Routes } from "./server";

const routes: Routes = {
	"/api/lorebook": {
		GET: lorebookHandler,
	},
	"/api/chat": {
		POST: chatHandler,
	},
};

const server = createServer(routes);

console.log(`Lorebook Chat running at http://localhost:${server.port}`);
